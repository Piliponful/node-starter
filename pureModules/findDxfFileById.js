const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const findDxfFileById = async ({ withSideEffects: { db, s3 }, input: { id, JWT } }) => {
  const dxfFile = db.collection('dxfFile')

  const { errors, value: caller } = getUserFromJwt({ JWT })

  if (errors.length) {
    return { errors }
  }

  const { errors: findDXFFileErrors, value: [{ name: filename, deleted, tenantId }] } = await dxfFile.find({ _id: ObjectID(id) })

  if (findDXFFileErrors.length) {
    return { errors: findDXFFileErrors }
  }

  if (deleted) {
    return { errors: ['The file was deleted'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== tenantId.toString()) {
    return { errors: ['You don\'t have the permission to download this file'] }
  }

  const file = await s3.getObject({ Key: filename }).promise()

  return { errors: [], value: file.Body.toString('utf8') }
}

module.exports = { findDxfFileById }
