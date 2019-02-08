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
  const { error: passwordMatchError, value: passwordMatch } = await User.doesPasswordMatch(email, password)

  if (passwordMatchError) {
    ctx.body = passwordMatchError
    return
  }

  if (!passwordMatch) {
    ctx.body = 'Your password doesn\'t match'
    return
  }

  const getJWTFromUserRes = await User.getJWTFromUser(email)

  ctx.body = getJWTFromUserRes
})

module.exports = router
