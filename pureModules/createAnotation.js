const path = require('path')
const { ObjectID } = require('mongodb')

const { validateAnotation } = require('./createAnotation')
const getUserFromJWT = require('./getUserFromJWT')

const createAnotation = async ({ withSideEffects: { db, s3 }, input: { files, gridPoints, dxfFileId, tenantId, JWT } }) => {
  const tenant = db.collection('tenant')
  const dxfFile = db.collection('dxfFile')
  const anotation = db.collection('anotation')

  const { errors, value: caller } = getUserFromJWT({ JWT })

  if (errors.length) {
    return { errors }
  }

  if (!['.pdf', '.csv', '.docx'].includes(path.extname(files[0].filename))) {
    return { errors: ['Wrong file type'] }
  }

  if (!ObjectID.isValid(dxfFileId)) {
    return { errors: [`DXF file id - ${dxfFileId} is invalid`] }
  }

  const { errors: tenantFindErrors, value: [tenantDoc] } = await tenant.find({ _id: ObjectID(tenantId) })

  if (tenantFindErrors.length) {
    return { errors: tenantFindErrors }
  }

  if (!tenantDoc) {
    return { errors: [`Tenant with id - ${tenantId} doesn't exist`] }
  }

  const { errors: dxfFileFindErrors, value: [dxf] } = await dxfFile.find({ _id: ObjectID(dxfFileId) })

  if (dxfFileFindErrors.length) {
    return { errors: dxfFileFindErrors }
  }

  if (!dxf) {
    return { errors: [`DXF file with id - ${dxfFileId} doesn't exist`] }
  }

  await s3.upload({ Key: files[0].filename, Body: files[0] }).promise()

  const anotationFields = { name: files[0].filename, gridPoints, createdBy: caller._id, dxfFileId, tenantId }

  const { errors: anotationValidationErrors, value: valid } = validateAnotation(anotationFields)

  if (valid) {
    await anotation.insert(anotationFields)
    return { value: true }
  } else {
    return { errors: anotationValidationErrors }
  }
}

module.exports = { createAnotation }
