const { getUserFromJwt } = require('./getUserFromJwt')

const findTenants = async ({ withSideEffects: { db }, input: { limit, skip, tenantId, files, JWT } }) => {
  const tenant = db.collection('tenant')
  const dxfFile = db.collection('dxfFile')
  const user = db.collection('user')
  const anotation = db.collection('anotation')

  const { errors, value: caller } = getUserFromJwt({ db }, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin) {
    return { errors: ['Only root admin has the permission to view tenants'] }
  }

  const { errors: tenantFindErrors, value: tenants } = await tenant.find({ deleted: false }, limit, skip)

  if (tenantFindErrors.length) {
    return { errors: tenantFindErrors }
  }

  try {
    const tenantsWithCount = await Promise.map(tenants, async t => {
      const userCount = await user.count({ tenantId: t._id.toString() })
      if (userCount.errors.length) {
        throw new Error('Error while counting')
      }

      const dxfFileCount = await dxfFile.count({ tenantId: t._id.toString() })
      if (dxfFileCount.errors.length) {
        throw new Error('Error while counting')
      }

      const anotationCount = await anotation.count({ tenantId: t._id.toString() })
      if (anotationCount.errors.length) {
        throw new Error('Error while counting')
      }

      return { ...t, userCount: userCount.value, dxfFileCount: dxfFileCount.value, anotationCount: anotationCount.value }
    })
    return { errors: [], value: tenantsWithCount }
  } catch (error) {
  }
}

module.exports = { findTenants }
