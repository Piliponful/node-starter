const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const deleteDxfFileById = async ({ withSideEffects: { db }, input: { id, jwt } }) => {
  const dxfFile = db.collection('dxfFile')

  const { errors, value: caller } = getUserFromJwt({ jwt })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You dont\'t have the permission to delete DXF files'] }
  }

  await dxfFile.update({ _id: ObjectID(id) }, { $set: { deleted: true } })

  return { value: true }
}

module.exports = { deleteDxfFileById }
