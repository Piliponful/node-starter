const { ObjectID } = require('mongodb')

const userFunctions = require('../entities/user')

const deleteAnotation = async ({ DBFunctions }, { tenantId, anotationId, JWT }) => {
  const { anotation } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantId !== tenantId) {
    return { errors: ['You dont\'t have the permission to delete anotation files'] }
  }

  await anotation.update({ _id: ObjectID(anotationId) }, { $set: { deleted: true } })

  return { value: true }
}

module.exports = { deleteAnotation }
