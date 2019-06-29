const path = require('path')
const { ObjectID } = require('mongodb')
const shortUUID = require('short-uuid')

const userFunctions = require('../entities/user')

const createAnotation = async ({ DBFunctions, logger, s3 }, { files, gridPoints, DXFFileId, tenantId, JWT }) => {
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

module.exports = { createAnotation }
