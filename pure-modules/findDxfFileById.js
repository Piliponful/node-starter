const { ObjectID } = require('mongodb')
const shortUUID = require('short-uuid')

const logger = require('../logger')
const userFunctions = require('../entities/user')

const findDxfFileById = async ({ DBFunctions, s3 }, { id, JWT }) => {
  const {
    DXFFile
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  const { errors: findDXFFileErrors, value: [{ name: filename, deleted, tenantId }] } = await DXFFile.find({ _id: ObjectID(id) })

  if (findDXFFileErrors.length) {
    return { errors: findDXFFileErrors }
  }

  if (deleted) {
    return { errors: ['The file was deleted'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== tenantId.toString()) {
    return { errors: ['You don\'t have the permission to download this file'] }
  }

  try {
    const file = await s3.getObject({ Key: filename }).promise()

    return { errors: [], value: file.Body.toString('utf8') }
  } catch (err) {
    logger.error({ err, id: shortUUID() })

    return { errors: ['Internal server error'] }
  }
}

module.exports = { findDxfFileById }
