const Router = require('koa-router')
const asyncBusboy = require('async-busboy')
const AWS = require('aws-sdk')
const config = require('config')
const promisify = require('es6-promisify')
const { ObjectID } = require('mongodb')

const DxfFile = require('../db/entities/dxfFile')
const User = require('../db/entities/user')
const logger = require('../logger')

const s3 = new AWS.S3({ credentials: { accessKeyId: config.aws.accessKey, secretAccessKey: config.aws.secretAccessKey } })

const router = new Router()

router.post('/dxf-file', async ctx => {
  const jwt = ctx.request.headers['authorization']
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const { fields, files } = await asyncBusboy(ctx.req)

  if (!user.rootAdmin && !user.tenantAdmin) {
    ctx.body = { errors: ['You dont\'t have the permission to upload dxf files'] }
    return
  }

  const s3Upload = () => new Promise((res, rej) => {
    s3.upload({ Bucket: 'arialpoint-staging-dxf', Key: files[0].filename, Body: files[0] }, (err, data) => {
      if (err) {
        rej(err)
      } else {
        res(data)
      }
    })
  })
  try {
    await s3Upload()
    ctx.body = await DxfFile.create({ name: files[0].filename, tenantId: fields.tenantId })
  } catch (err) {
    logger.error(err, 'Problem with uploading dxf file to S3, post /dxf-file')
    ctx.body = { errors: ['Internal server error'] }
    return
  }
})

router.get('/dxf-file', async ctx => {
  ctx.body = await DxfFile.find({ deleted: false })
})

router.get('/dxf-file/:id', async ctx => {
  const { errors, value: [{ name: filename, deleted }] } = await DxfFile.find({ _id: ObjectID(ctx.params.id) })
  if (errors.length) {
    ctx.body = { errors }
    return
  }

  if (deleted) {
    ctx.body = { errors: ['The file was deleted'] }
    return
  }

  const s3Download = () => new Promise((res, rej) => {
    s3.getObject({ Bucket: 'arialpoint-staging-dxf', Key: filename }, (err, data) => {
      if (err) {
        rej(err)
      } else {
        res(data)
      }
    })
  })
  try {
    const file = await s3Download()
    ctx.body = file
  } catch (err) {
    logger.error(err, 'Problem with uploading dxf file to S3, post /dxf-file')
    ctx.body = { errors: ['Internal server error'] }
    return
  }
})

router.delete('/dxf-file/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.rootAdmin && !user.tenantAdmin) {
    ctx.body = { errors: ['You dont\'t have the permission to delete dxf files'] }
    return
  }

  ctx.body = await DxfFile.update({ _id: ObjectID(ctx.params.id) }, { $set: { deleted: true } })
})

module.exports = router
