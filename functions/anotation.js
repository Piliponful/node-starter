const path = require('path')
const AWS = require('aws-sdk')
const config = require('config')
const { ObjectID } = require('mongodb')
const shortUUID = require('short-uuid')

const userFunctions = require('../entities/user')

const logger = require('../logger')

const s3 = new AWS.S3({
  params: {
    Bucket: 'arialpoint-staging-anotations'
  },
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey
  }
})

const createAnotation = async ({ DBFunctions }, { files, gridPoints, DXFFileId, tenantId, JWT }) => {
  const {
    tenant,
    DXFFile,
    anotation
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!['.pdf', '.csv', '.docx'].includes(path.extname(files[0].filename))) {
    return { errors: ['Wrong file type'] }
  }

  if (!ObjectID.isValid(DXFFileId)) {
    return { errors: [`DXF file id - ${DXFFileId} is invalid`] }
  }

  const { errors: tenantFindErrors, value: [tenantDoc] } = await tenant.find({ _id: ObjectID(tenantId) })

  if (tenantFindErrors.length) {
    return { errors: tenantFindErrors }
  }

  if (!tenantDoc) {
    return { errors: [`Tenant with id - ${tenantId} doesn't exist`] }
  }

  const { errors: DXFFileFindErrors, value: [DXF] } = await DXFFile.find({ _id: ObjectID(DXFFileId) })

  if (DXFFileFindErrors.length) {
    return { errors: DXFFileFindErrors }
  }

  if (!DXF) {
    return { errors: [`DXF file with id - ${DXFFileId} doesn't exist`] }
  }

  try {
    await s3.upload({ Key: files[0].filename, Body: files[0] }).promise()
    await anotation.create({ name: files[0].filename, gridPoints, createdBy: caller._id, DXFFileId, tenantId })

    return { value: true }
  } catch (err) {
    logger.error({ err, id: shortUUID() })
    return { errors: ['Internal server error'] }
  }
}

const getAnotation = async ({ DBFunctions }, { DXFFileId, createdBy, JWT }) => {
  const { anotation, DXFFile, user } = DBFunctions
  const { errors } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  const queryForCreatedBy = { createdBy }
  const queryForDXFFileId = { DXFFileId }
  const commonQuery = { deleted: true }
  const query = Object.assign(commonQuery, createdBy ? queryForCreatedBy : {}, DXFFileId ? queryForDXFFileId : {})

  if (DXFFileId && !ObjectID.isValid(DXFFileId)) {
    return { errors: [`DXF file id - ${DXFFileId} is not valid`] }
  }

  const { errors: DXFFileFindErrors, value: [DXFFileDoc] } = await DXFFile.find({ _id: ObjectID(DXFFileId) })

  if (DXFFileFindErrors.length) {
    return { errors: DXFFileFindErrors }
  }

  if (!DXFFileDoc) {
    return { errors: [`DXF file with id - ${DXFFileId} doesn't exist`] }
  }

  if (createdBy && !ObjectID.isValid(createdBy)) {
    return { errors: [`User with id - ${createdBy} is not valid`] }
  }

  const { errors: userFindErrors, value: [userDoc] } = await user.find({ _id: ObjectID(createdBy) })

  if (userFindErrors.length) {
    return { errors: userFindErrors }
  }

  if (!userDoc) {
    return { errors: [`User with id - ${createdBy} doesn't exist`] }
  }

  const findAnotationResponse = await anotation.find(query)

  return findAnotationResponse
}

const getAnotationById = async ({ DBFunctions }, { DXFFileId, createdBy, anotationId, JWT }) => {
  const { anotation } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  const { errors: findAnotationErrors, value: [{ name: filename, deleted, tenantId }] } = await anotation.find({ _id: ObjectID(anotationId) })

  if (findAnotationErrors.length) {
    return { errors: findAnotationErrors }
  }

  if (deleted) {
    return { errors: ['The file was deleted'] }
  }

  if (!caller.rootAdmin && !caller.tenantId !== tenantId) {
    return { errors: ['You dont\'t have the permission to download anotation files'] }
  }

  try {
    const file = await s3.getObject({ Key: filename }).promise()
    return { errors: [], value: file }
  } catch (err) {
    logger.error({ err, id: shortUUID() })
    return { errors: ['Internal server error'] }
  }
}

const deleteAnotation = async ({ DBFunctions }, { tenantId, anotationId, JWT }) => {
  const { anotation } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantId !== tenantId) {
    return { errors: ['You dont\'t have the permission to delete anotation files'] }
  }

  await anotation.update({ _id: ObjectID(anotationId) }, { $set: { deleted: true } })

  return { value: true }
}

module.exports = { createAnotation, getAnotation, getAnotationById, deleteAnotation }
