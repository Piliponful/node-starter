const Router = require('koa-router')
const router = new Router()

const User = require('../db/entities/user')

router.post('/user', async ctx => {
  const { jwt, firstname, lastname, email, password, tenantAdmin, tenantId } = ctx.request.body

  const { error: getUserFromJWTError, value: user } = User.getUserFromJWT(jwt)

  if (getUserFromJWTError) {
    ctx.body = { error: getUserFromJWTError }
    return
  }

  if (!user.tenantAdmin && !user.rootAdmin) {
    ctx.body = { error: 'You don\'t have the permission to create users' }
    return
  }

  if (!user.rootAdmin && tenantAdmin) {
    ctx.body = { error: 'You don\'t have the permission to create tenant admin' }
    return
  }

  if (user.tenantAdmin && user.tenantId !== tenantId) {
    ctx.body = { error: 'You can create users only for tenant you\'re an admin of' }
    return
  }

  const userCreationRes = await User.create({
    firstname,
    lastname,
    email,
    password,
    tenantAdmin,
    tenantId
  })

  ctx.body = userCreationRes
})

router.post('/user/login', async ctx => {
  const { password, email } = ctx.request.body
  const passwordMatchRes = await User.doesPasswordMatch(email, password)

  if (passwordMatchRes.error.external) {
    console.log('PASSWORD MATCH RES: ', passwordMatchRes)
    ctx.response.status = 400
    ctx.body = passwordMatchRes.error.external
    return
  }

  if (!passwordMatchRes.value) {
    ctx.response.status = 400
    ctx.body = 'Your password doesn\'t match'
    return
  }

  const getJWTRes = await User.getJWTFromUser(email)

  if (getJWTRes.error.external) {
    ctx.response.status = 400
    ctx.body = getJWTRes.error.external
    return
  }

  ctx.body = getJWTRes.value
})

module.exports = router
