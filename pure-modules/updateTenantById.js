const { ObjectId } = require('mongodb')

const userFunctions = require('../entities/user')

const updateTenantById = async ({ DBFunctions }, { id, JWT, newTenant }) => {
  const { tenant } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You don\'t have the permission to update this tenant'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== id) {
    return { errors: [`You have the permission to update tenant with id - ${id}`] }
  }

  return tenant.update({ _id: ObjectId(id) }, { $set: newTenant })
}

module.exports = { updateTenantById }
