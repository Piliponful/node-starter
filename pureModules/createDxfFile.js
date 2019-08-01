const path = require('path')
const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')
const { validateDxfFile } = require('./validateDxfFile')

const createDxfFile = async ({ db, s3 }, { tenantId, files, jwt }) => {
  const tenant = db.collection('tenants')
  const dxfFile = db.collection('dxfFiles')

  const { errors, value: caller } = getUserFromJwt({ jwt })

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
  } = await dxfFile.find({ name: files[0].filename, tenantId: ObjectID(tenantId) })

  if (DXFFileFindErrors.length) {
    return { errors: DXFFileFindErrors }
  }

  if (existingDxfFile) {
    return { errors: ['File with such name already exists'] }
  }

  await s3.upload({ Key: files[0].filename, Body: files[0] }).promise()

  const dxfFileFields = { name: files[0].filename, tenantId }

  const { errors: dxfFileValidationErrors, value: valid } = validateDxfFile(dxfFileFields)

  if (valid) {
    const { errors: DXFFileCreationErrors, value: DXFFileCreationRes } = await dxfFile.insert()

    if (DXFFileCreationErrors.length) {
      return { errors: DXFFileCreationErrors }
    }

    return { errors: [], value: DXFFileCreationRes }
  } else {
    return { errors: dxfFileValidationErrors }
  }
}

module.exports = { createDxfFile }
