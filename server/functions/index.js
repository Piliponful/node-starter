const createRouter = (userEntity, tenantEntity, auth) => {
  const Router = require('koa-router')

  const { createUserRouter } = require('./user')
  // const tenant = require('./tenant')
  // const dxfFile = require('./dxfFile')
  // const anotation = require('./anotation')

  const router = new Router()
  const userRouter = createUserRouter(userEntity, tenantEntity, auth)

  router.use(userRouter.routes())
  // router.use(tenant.routes())
  // router.use(dxfFile.routes())
  // router.use(anotation.routes())

  return router
}

module.exports = { createRouter }
