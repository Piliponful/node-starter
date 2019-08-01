const { ObjectId } = require('mongodb')

const { getUserFromJwt } = require('./getUserFromJwt')

const updateTenantById = async ({ withSidEffects: { db }, input: { id, jwt, newTenant } }) => {
  const tenantsCollection = db.collection('tenant')

  const { errors, value: caller } = getUserFromJwt({ input: { jwt } })

  if (errors) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You don\'t have the permission to update this tenant'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== id) {
    return { errors: [`You have the permission to update tenant with id - ${id}`] }
  }

  await tenantsCollection.update({ _id: ObjectId(id) }, { $set: newTenant })

  return { value: true }
}

module.exports = { updateTenantById }
