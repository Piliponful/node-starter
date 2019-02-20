const path = require('path')
const Router = require('koa-router')
const asyncBusboy = require('async-busboy')
const AWS = require('aws-sdk')
const config = require('config')
const { ObjectID } = require('mongodb')

const DxfFile = require('../db/entities/dxfFile')
const User = require('../db/entities/user')
const Tenant = require('../db/entities/tenant')

const logger = require('../logger')

const s3 = new AWS.S3({
  params: {
    Bucket: 'arialpoint-staging-dxf'
  },
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey
  }
})

const router = new Router()

router.post('/dxf-file', async ctx => {
  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in authorization header'] }
    return
  }
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const { fields: { tenantId }, files } = await asyncBusboy(ctx.req)

  if (path.extname(files[0].filename) !== '.dxf') {
    ctx.body = { errors: ['Wrong file type'] }
    return
  }

  if (!user.rootAdmin) {
    ctx.body = { errors: ['You dont\'t have the permission to upload dxf files'] }
    return
  }

  if (!ObjectID.isValid(tenantId)) {
    ctx.body = { errors: ['tenantId is not valid'] }
    return
  }

  const { errors: tenantFindErrors, value: [tenant] } = await Tenant.find({ _id: ObjectID(tenantId) })

  if (tenantFindErrors.length) {
    ctx.body = { errors: tenantFindErrors }
    return
  }

  if (!tenant) {
    ctx.body = { errors: ['You trying to upload file to non existant tenant'] }
    return
  }

  try {
    await s3.upload({ Key: files[0].filename, Body: files[0] }).promise()
    const { errors: dxfFileCreationErrors, value: dxfFileCreationRes } = await DxfFile.create({ name: files[0].filename, tenantId })
    if (dxfFileCreationErrors.length) {
      ctx.body = { errors: dxfFileCreationErrors }
      return
    }
    ctx.body = { errors: [], value: dxfFileCreationRes }
  } catch (err) {
    logger.error(err, 'Problem with uploading dxf file to S3, post /dxf-file')
    ctx.body = { errors: ['Internal server error'] }
  }
})

router.get('/dxf-file', async ctx => {
  const { tenantId } = ctx.query
  if (!tenantId) {
    if (ObjectID.isValid(tenantId)) {
      ctx.body = { errors: ['TenantId is invalid'] }
      return
    }
  }
  ctx.body = await DxfFile.find({ deleted: false })
})

router.get('/dxf-file/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in authorization header'] }
    return
  }
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const { errors, value: [{ name: filename, deleted, tenantId }] } = await DxfFile.find({ _id: ObjectID(ctx.params.id) })
  if (errors.length) {
    ctx.body = { errors }
    return
  }

  if (deleted) {
    ctx.body = { errors: ['The file was deleted'] }
    return
  }

  if (!user.rootAdmin && user.tenantId !== tenantId.toString()) {
    ctx.body = { errors: ['You don\'t have the permission to download this file'] }
    return
  }

  try {
    const file = await s3.getObject({ Key: filename }).promise()
    ctx.body = { errors: [], value: file.Body.toString('utf8') }
  } catch (err) {
    logger.error(err, 'Problem with uploading dxf file to S3, post /dxf-file')
    ctx.body = { errors: ['Internal server error'] }
  }
})

router.delete('/dxf-file/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in authorization header'] }
    return
  }
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
