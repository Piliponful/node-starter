const userFunctions = require('../entities/user')

const findTenant = async ({ DBFunctions }, { limit, skip, tenantId, files, JWT }) => {
  const { tenant, DXFFile, user, anotation } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

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

      const dxfFileCount = await DXFFile.count({ tenantId: t._id.toString() })
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

module.exports = { findTenant }
