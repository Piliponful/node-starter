const path = require('path')
const shortUUID = require('short-uuid')
const { ObjectID } = require('mongodb')

const userFunctions = require('../entities/user')
const logger = require('../logger')

const createDxfFile = async ({ DBFunctions, s3 }, { tenantId, files, JWT }) => {
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

module.exports = { createDxfFile }
