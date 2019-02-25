const Router = require('koa-router')
const { ObjectId } = require('mongodb')
const Promise = require('bluebird')

const Tenant = require('../db/entities/tenant')
const User = require('../db/entities/user')
const DxfFile = require('../db/entities/dxfFile')
const Anotation = require('../db/entities/anotation')

const { authenticate } = require('../middleware/auth')

const router = new Router()

router.get('/tenant', authenticate, async ctx => {
  const { limit, skip } = ctx.query

  if (!ctx.user.rootAdmin) {
    ctx.body = { errors: ['Only root admin has the permission to view tenants'] }
    return
  }

  const { errors: tenantFindErrors, value: tenants } = await Tenant.find({ deleted: false }, limit, skip)

  if (tenantFindErrors.length) {
    ctx.body = { errors: tenantFindErrors }
    return
  }

  try {
    const tenantsWithCount = await Promise.map(tenants, async t => {
      const userCount = await User.count({ tenantId: t._id.toString() })
      if (userCount.errors.length) {
        ctx.body = userCount
        throw new Error('Error while counting')
      }

      const dxfFileCount = await DxfFile.count({ tenantId: t._id.toString() })
      if (dxfFileCount.errors.length) {
        ctx.body = dxfFileCount
        throw new Error('Error while counting')
      }

      const anotationCount = await Anotation.count({ tenantId: t._id.toString() })
      if (anotationCount.errors.length) {
        ctx.body = anotationCount
        throw new Error('Error while counting')
      }

      return { ...t, userCount: userCount.value, dxfFileCount: dxfFileCount.value, anotationCount: anotationCount.value }
    })
    ctx.body = { errors: [], value: tenantsWithCount }
  } catch (error) {
  }
})

router.get('/tenant/:id', authenticate, async ctx => {
  const { id } = ctx.params
  const { findByName } = ctx.query

  const query = findByName ? { name: id } : { _id: ObjectId(id) }
  const { errors, value: [tenant] } = await Tenant.find(query)

  if (errors.length) {
    ctx.body = { errors }
    return
  }

  if (!ctx.user.rootAdmin && !ctx.user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to view this tenant'] }
    return
  }

  if (!ctx.user.rootAdmin && ctx.user.tenantId !== tenant._id) {
    ctx.body = { errors: [`You have the permission to view tenant with id ${tenant._id}`] }
    return
  }

  if (tenant.deleted) {
    ctx.body = { errors: ['Tenant has been deleted'] }
    return
  }

  ctx.body = { errors: [], value: tenant }
})

router.patch('/tenant/:id', authenticate, async ctx => {
  const { id } = ctx.params

  if (!ctx.user.rootAdmin && !ctx.user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to update this tenant'] }
    return
  }

  if (!ctx.user.rootAdmin && ctx.user.tenantId !== id) {
    ctx.body = { errors: [`You have the permission to update tenant with id - ${id}`] }
    return
  }

  ctx.body = await Tenant.update({ _id: ObjectId(id) }, { $set: ctx.request.body })
})

router.delete('/tenant/:id', authenticate, async ctx => {
  const { id } = ctx.params

  if (!ctx.user.rootAdmin && !ctx.user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to delete this tenant'] }
    return
  }

  if (!ctx.user.rootAdmin && ctx.user.tenantId !== id) {
    ctx.body = { errors: [`You have the permission to delete tenant with id - ${id}`] }
    return
  }

  ctx.body = await Tenant.update({ _id: ObjectId(id) }, { $set: { deleted: true } })
})

module.exports = router
