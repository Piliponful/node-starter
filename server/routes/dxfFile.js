const Router = require('koa-router')
const asyncBusboy = require('async-busboy')
const AWS = require('aws-sdk')
const config = require('config')
const promisify = require('es6-promisify')

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

  if (!user.rootAdmin) {
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

module.exports = router
