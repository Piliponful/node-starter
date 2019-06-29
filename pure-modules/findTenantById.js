const { ObjectId } = require('mongodb')

const userFunctions = require('../entities/user')

const findTenantById = async ({ DBFunctions }, { id, findByName, JWT }) => {
  const { tenant } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You don\'t have the permission to view this tenant'] }
  }

  const query = findByName ? { name: id } : { _id: ObjectId(id) }

  const { errors: findTenantErrors, value: [tenantDoc] } = await tenant.find(query)

  if (findTenantErrors.length) {
    return { errors: findTenantErrors }
  }

  if (!caller.rootAdmin && caller.tenantId !== tenant._id) {
    return { errors: [`You have the permission to view tenant with id ${tenant._id}`] }
  }

  if (tenantDoc.deleted) {
    return { errors: ['Tenant has been deleted'] }
  }

  return { errors: [], value: tenantDoc }
}

module.exports = { findTenantById }
