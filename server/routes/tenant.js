const Router = require('koa-router')
const { ObjectId } = require('mongodb')

const Tenant = require('../db/entities/tenant')
const User = require('../db/entities/user')
const DxfFile = require('../db/entities/dxfFile')
const Anotation = require('../db/entities/anotation')

const Promise = require('bluebird')

const router = new Router()

router.get('/tenant', async ctx => {
  const { limit, skip } = ctx.query

  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in authorization header'] }
    return
  }
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.rootAdmin) {
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
      const userCount = await User.count({ tenantId: t._id })
      if (userCount.errors.length) {
        ctx.body = userCount
        throw new Error('Error while counting')
      }

      const dxfFileCount = await DxfFile.count({ tenantId: t._id })
      if (dxfFileCount.errors.length) {
        ctx.body = dxfFileCount
        throw new Error('Error while counting')
      }

      const anotationCount = await Anotation.count({ tenantId: t._id })
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

router.get('/tenant/:id', async ctx => {
  const { id } = ctx.params
  const { findByName } = ctx.query

  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token in authorization header'] }
    return
  }
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  const query = findByName ? { name: id } : { _id: ObjectId(id) }
  const { errors, value: [tenant] } = await Tenant.find(query)

  if (errors.length) {
    ctx.body = { errors }
    return
  }

  if (!user.rootAdmin && !user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to view this tenant'] }
    return
  }

  if (!user.rootAdmin && user.tenantId !== tenant._id) {
    ctx.body = { errors: [`You have the permission to view tenant with id ${tenant._id}`] }
    return
  }

  if (tenant.deleted) {
    ctx.body = { errors: ['Tenant has been deleted'] }
    return
  }

  ctx.body = { errors: [], value: tenant }
})

router.patch('/tenant/:id', async ctx => {
  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    return { errors: ['You have to supply jwt token in authorization header'] }
  }
  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)
  const { id } = ctx.params

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.rootAdmin && !user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to update this tenant'] }
    return
  }

  if (!user.rootAdmin && user.tenantId !== id) {
    ctx.body = { errors: [`You have the permission to update tenant with id - ${id}`] }
    return
  }

  ctx.body = await Tenant.update({ _id: ObjectId(id) }, { $set: ctx.request.body })
})

router.delete('/tenant/:id', async ctx => {
  const { id } = ctx.params
  const jwt = ctx.request.headers['authorization']
  if (!jwt) {
    return { errors: ['You have to supply jwt token in authorization header'] }
  }

  const { errors: getUserFromJWTErrors, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  if (!user.rootAdmin && !user.tenantAdmin) {
    ctx.body = { errors: ['You don\'t have the permission to delete this tenant'] }
    return
  }

  if (!user.rootAdmin && user.tenantId !== id) {
    ctx.body = { errors: [`You have the permission to delete tenant with id - ${id}`] }
    return
  }

  ctx.body = await Tenant.update({ _id: ObjectId(id) }, { $set: { deleted: true } })
})

module.exports = router
