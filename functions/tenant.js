const { ObjectId } = require('mongodb')
const Promise = require('bluebird')

const userFunctions = require('../entities/user')

const find = async ({ DBFunctions }, { limit, skip, tenantId, files, JWT }) => {
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

const findById = async ({ DBFunctions }, { id, findByName, JWT }) => {
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

const updateById = async ({ DBFunctions }, { id, JWT, newTenant }) => {
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

const deleteById = async ({ DBFunctions }, { id, JWT }) => {
  const { tenant } = DBFunctions

  const { errors, value: caller } = userFunctions.JWTToUser(DBFunctions, { JWT })

  if (errors.length) {
    return { errors }
  }

  if (!caller.rootAdmin && !caller.tenantAdmin) {
    return { errors: ['You don\'t have the permission to delete this tenant'] }
  }

  if (!caller.rootAdmin && caller.tenantId !== id) {
    return { errors: [`You have the permission to delete tenant with id - ${id}`] }
  }

  return tenant.update({ _id: ObjectId(id) }, { $set: { deleted: true } })
}

module.exports = { find, findById, updateById, deleteById }
