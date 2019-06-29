const shortUUID = require('short-uuid')
const { ObjectID } = require('mongodb')

const logger = require('../logger')
const userFunctions = require('../entities/user')

const getAnotationById = async ({ DBFunctions, s3 }, { DXFFileId, createdBy, anotationId, JWT }) => {
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

module.exports = { getAnotationById }
