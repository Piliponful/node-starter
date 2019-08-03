const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const getAnotationById = async ({ withSideEffects: { db, s3 }, input: { dxfFileId, createdBy, anotationId, jwt } }) => {
  const anotationsCollection = db.collection('anotation')

  const { errors, value: caller } = getUserFromJwt({ jwt })

  if (errors.length) {
    return { errors }
  }

  const {
    errors: findAnotationErrors,
    value: [{ name: filename, deleted, tenantId }]
  } = await anotationsCollection.find({ _id: ObjectID(anotationId) })

  if (findAnotationErrors.length) {
    return { errors: findAnotationErrors }
  }

  if (deleted) {
    return { errors: ['The file was deleted'] }
  }

  if (!caller.rootAdmin && !caller.tenantId !== tenantId) {
    return { errors: ['You dont\'t have the permission to download anotation files'] }
  }

  const file = await s3.getObject({ Key: filename }).promise()
  return { errors: [], value: file }
}

module.exports = { getAnotationById }
