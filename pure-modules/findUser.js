const { ObjectID } = require('mongodb')

const findUser = async ({ DBFunctions }, { limit, skip, tenantId }) => {
  const { tenant, user } = DBFunctions

  let query = { deleted: false }

  if (tenantId) {
    if (!ObjectID.isValid(tenantId)) {
      return { errors: ['tenantId is invalid'] }
    }

    const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenant.find({ _id: ObjectID(tenantId) })

    if (findTenantErrors.length) {
      return { errors: findTenantErrors }
    }

    if (!tenantDoc) {
      return { errors: [`Tenant wasn't found`] }
    }

    if (tenantDoc.deleted) {
      return { errors: [`Tenant deleted`] }
    }

    query['tenantId'] = tenantId
  }

  return user.find(query, limit, skip, { password: 0 })
}

module.exports = { findUser }
