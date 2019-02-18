const path = require('path')
const Router = require('koa-router')
const asyncBusboy = require('async-busboy')
const AWS = require('aws-sdk')
const config = require('config')
const { ObjectID } = require('mongodb')
const lodash = require('lodash')

const DxfFile = require('../db/entities/dxfFile')
const User = require('../db/entities/user')
const Anotation = require('../db/entities/anotation')

const logger = require('../logger')

const s3 = new AWS.S3({ credentials: { accessKeyId: config.aws.accessKey, secretAccessKey: config.aws.secretAccessKey } })

const router = new Router()

router.post('/anotation', async ctx => {
  const jwt = ctx.request.headers['authorization']
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const { fields: { gridPoints, dxfFileId }, files } = await asyncBusboy(ctx.req)

  if (!['.pdf', '.csv', '.docx'].includes(path.extname(files[0].filename))) {
    ctx.body = { errors: ['Wrong file type'] }
    return
  }

  if (!ObjectID.isValid(dxfFileId)) {
    ctx.body = { errors: ['DXF file id is invalid'] }
    return
  }

  const { errors: dxfFileFindErrors, value: [dxf] } = await DxfFile.find({ _id: ObjectID(dxfFileId) })

  if (dxfFileFindErrors.length) {
    ctx.body = { errors: dxfFileFindErrors }
    return
  }

  if (!dxf) {
    ctx.body = { errors: ['You trying to upload file to non existant tenant'] }
    return
  }

  const s3Upload = () => new Promise((resolve, reject) => {
    s3.upload({ Bucket: 'arialpoint-staging-anotations', Key: files[0].filename, Body: files[0] }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  try {
    await s3Upload()
    ctx.body = await Anotation.create({ name: files[0].filename, gridPoints, createdBy: user._id, dxfFileId })
  } catch (err) {
    logger.error(err, 'Problem with uploading anotation file to S3, post /anotation')
    ctx.body = { errors: ['Internal server error'] }
  }
})

router.get('/anotation', async ctx => {
  ctx.body = await Anotation.find({ ...ctx.query, deleted: false })
})

router.get('/anotation/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const { errors, value: [{ name: filename, deleted, tenantId }] } = await Anotation.find({ _id: ObjectID(ctx.params.id) })

  if (errors.length) {
    ctx.body = { errors }
    return
  }

  if (deleted) {
    ctx.body = { errors: ['The file was deleted'] }
    return
  }

  if (!user.rootAdmin && !user.tenantId !== tenantId) {
    ctx.body = { errors: ['You dont\'t have the permission to download anotation files'] }
    return
  }

  const s3Download = () => new Promise((resolve, reject) => {
    s3.getObject({ Bucket: 'arialpoint-staging-anotations', Key: filename }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  try {
    const file = await s3Download()
    ctx.body = { errors: [], value: file }
  } catch (err) {
    logger.error(err, 'Problem with downloading anotation file from S3, post /anotation')
    ctx.body = { errors: ['Internal server error'] }
  }
})

router.delete('/anotation/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)
  const { tenantId } = ctx.req.body

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.rootAdmin && !user.tenantId !== tenantId) {
    ctx.body = { errors: ['You dont\'t have the permission to delete anotation files'] }
    return
  }

  ctx.body = await DxfFile.update({ _id: ObjectID(ctx.params.id) }, { $set: { deleted: true } })
})

module.exports = router
