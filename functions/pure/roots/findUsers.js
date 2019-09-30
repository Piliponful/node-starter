const { ObjectID } = require('mongodb')

const findUsers = async ({ withSideEffects: { db }, input: { limit, skip, tenantId } }) => {
  const tenantCollection = db.collection('tenant')
  const userCollection = db.collection('user')

  let query = { deleted: false }

  if (tenantId) {
    if (!ObjectID.isValid(tenantId)) {
      return { errors: ['tenantId is invalid'] }
    }

    const { errors: findTenantErrors, value: [tenantDoc] = [] } = await tenantCollection.find({ _id: ObjectID(tenantId) })

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

  await userCollection.find(query, limit, skip, { password: 0 })

  return { value: true }
}

module.exports = { findUsers }
