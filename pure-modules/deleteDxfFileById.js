const { ObjectID } = require('mongodb')

const userFunctions = require('../entities/user')

const deleteDxfFileById = async ({ DBFunctions }, { id, JWT }) => {
  const {
    DXFFile
  } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You dont\'t have the permission to delete DXF files'] }
  }

  return DXFFile.update({ _id: ObjectID(id) }, { $set: { deleted: true } })
}

module.exports = { deleteDxfFileById }
