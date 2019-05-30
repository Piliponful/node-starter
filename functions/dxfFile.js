const path = require('path')
const AWS = require('aws-sdk')
const config = require('config')
const { ObjectID } = require('mongodb')
const shortUUID = require('short-uuid')

const userFunctions = require('../entities/user')

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

const create = async ({ DBFunctions }, { tenantId, files, JWT }) => {
  const {
    tenant,
    DXFFile
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (path.extname(files[0].filename) !== '.dxf') {
    return { errors: ['Wrong file type'] }
  }

  if (!caller.rootAdmin) {
    return { errors: ['You dont\'t have the permission to upload dxf files'] }
  }

  if (!ObjectID.isValid(tenantId)) {
    return { errors: ['tenantId is not valid'] }
  }

  const { errors: tenantFindErrors, value: [tenantDoc] } = await tenant.find({ _id: ObjectID(tenantId) })

  if (tenantFindErrors.length) {
    return { errors: tenantFindErrors }
  }

  if (!tenantDoc) {
    return { errors: ['You trying to upload file to non existant tenant'] }
  }

  const {
    errors: DXFFileFindErrors,
    value: [existingDxfFile] = []
  } = await DXFFile.find({ name: files[0].filename, tenantId: ObjectID(tenantId) })

  if (DXFFileFindErrors.length) {
    return { errors: DXFFileFindErrors }
  }

  if (existingDxfFile) {
    return { errors: ['File with such name already exists'] }
  }

  try {
    await s3.upload({ Key: files[0].filename, Body: files[0] }).promise()

    const { errors: DXFFileCreationErrors, value: DXFFileCreationRes } = await DXFFile.create({ name: files[0].filename, tenantId })

    if (DXFFileCreationErrors.length) {
      return { errors: DXFFileCreationErrors }
    }

    return { errors: [], value: DXFFileCreationRes }
  } catch (err) {
    logger.error({ err, id: shortUUID() })

    return { errors: ['Internal server error'] }
  }
}

const find = async ({ DBFunctions: { DXFFile }, tenantId }) => {
  if (!tenantId) {
    if (ObjectID.isValid(tenantId)) {
      return { errors: ['TenantId is invalid'] }
    }
  }

  return DXFFile.find({ deleted: false })
}

const findById = async ({ DBFunctions }, { id, JWT }) => {
  const {
    DXFFile
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  const { errors: findDXFFileErrors, value: [{ name: filename, deleted, tenantId }] } = await DXFFile.find({ _id: ObjectID(id) })

  if (findDXFFileErrors.length) {
    return { errors: findDXFFileErrors }
  }

  if (deleted) {
    return { errors: ['The file was deleted'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== tenantId.toString()) {
    return { errors: ['You don\'t have the permission to download this file'] }
  }

  try {
    const file = await s3.getObject({ Key: filename }).promise()

    return { errors: [], value: file.Body.toString('utf8') }
  } catch (err) {
    logger.error({ err, id: shortUUID() })

    return { errors: ['Internal server error'] }
  }
}

const deleteById = async ({ DBFunctions }, { id, JWT }) => {
  const {
    DXFFile
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You dont\'t have the permission to delete DXF files'] }
  }

  return DXFFile.update({ _id: ObjectID(id) }, { $set: { deleted: true } })
}

module.exports = { create, find, findById, deleteById }
