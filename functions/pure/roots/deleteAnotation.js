const { ObjectID } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const deleteAnotation = async ({ withSideEffects: { db }, input: { tenantId, id, jwt } }) => {
  const anotation = db.collection('anotations')

  const { errors, value: caller } = getUserFromJwt({ jwt })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantId !== tenantId) {
    return { errors: ['You dont\'t have the permission to delete anotation files'] }
  }

  await anotation.update({ _id: ObjectID(id) }, { $set: { deleted: true } })

  return { value: true }
}

module.exports = { deleteAnotation }
