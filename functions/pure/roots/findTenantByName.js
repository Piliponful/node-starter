const { getUserFromJwt } = require('./getUserFromJwt')

const findTenantByName = async ({ withSideEffects: { db }, input: { name, jwt } }) => {
  const tenant = db.collection('tenant')

  const { errors, value: caller } = getUserFromJwt({ jwt })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You don\'t have the permission to view this tenant'] }
  }

  const { errors: findTenantErrors, value: [tenantDoc] } = await tenant.find({ name })

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

module.exports = { findTenantByName }
