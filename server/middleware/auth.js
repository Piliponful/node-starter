const createAuthMiddleware = userEntity => async (ctx, next) => {
  const jwt = ctx.request.headers['authorization']

  if (!jwt) {
    ctx.body = { errors: ['You have to supply jwt token'] }
    return
  }

  const { errors: getUserFromJWTErrors, value: user } = userEntity.getUserFromJWT(jwt)

  if (getUserFromJWTErrors.length) {
    ctx.body = { errors: getUserFromJWTErrors }
    return
  }

  ctx.user = user

  await next()
}

module.exports = { createAuthMiddleware }
