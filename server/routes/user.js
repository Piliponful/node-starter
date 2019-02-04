const Router = require('koa-router')
const router = new Router()
const user = require('../db/entities/user')

router.post('/user', async ctx => {
  const { jwt, username, email, password, tenantAdmin, tenantId } = ctx.request.body
  const user = user.getUserFromJWT(ctx.body.jwt)
  if (ctx.body.tenantAdmin && !user.rootAdmin) {
    return ctx.body = { error: 'You don\'t have the permissions to create a tennant admin' }
  }
  const userCreationRes = await user.create({
    username,
    email,
    password,
    tenantAdmin,
    tenantId
  })
  return ctx.body = userCreationRes.error
})

module.exports = router
