const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const findAnotations = async ({ withSidEffects: { db }, input: { DXFFileId, createdBy, JWT } }) => {
  const anotationsCollection = db.collection('anotations')
  const dxfFilesCollection = db.collection('dxfFiles')
  const usersCollection = db.collection('users')

  const { errors } = getUserFromJwt({ input: { JWT } })

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

  const { errors: DXFFileFindErrors, value: [DXFFileDoc] } = await dxfFilesCollection.find({ _id: ObjectID(DXFFileId) })

  if (DXFFileFindErrors.length) {
    return { errors: DXFFileFindErrors }
  }

  if (!DXFFileDoc) {
    return { errors: [`DXF file with id - ${DXFFileId} doesn't exist`] }
  }

  if (createdBy && !ObjectID.isValid(createdBy)) {
    return { errors: [`User with id - ${createdBy} is not valid`] }
  }

  const { errors: userFindErrors, value: [userDoc] } = await usersCollection.find({ _id: ObjectID(createdBy) })

  if (userFindErrors.length) {
    return { errors: userFindErrors }
  }

  if (!userDoc) {
    return { errors: [`User with id - ${createdBy} doesn't exist`] }
  }

  const findAnotationResponse = await anotationsCollection.find(query)

  return findAnotationResponse
}

module.exports = { findAnotations }
