const { ObjectID } = require('mongodb')

const userFunctions = require('../entities/user')

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

module.exports = { getAnotation }
