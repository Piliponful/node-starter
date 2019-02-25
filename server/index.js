const main = async () => {
  const Koa = require('koa')
  const bodyParser = require('koa-bodyparser')

  const { createDb } = require('./db/connection')
  const db = await createDb()

  const { createUserEntity } = require('./db/entities/user')
  const userEntity = await createUserEntity(db)

  const { createTenantEntity } = require('./db/entities/tenant')
  const tenantEntity = await createTenantEntity(db)

  const { createAuthMiddleware } = require('./middleware/auth')
  const auth = createAuthMiddleware(userEntity)

  const { createRouter } = require('./routes')
  const router = createRouter(userEntity, tenantEntity, auth)

  const app = new Koa()

  app.use(bodyParser())
  app.use(router.routes())

  app.listen(80)
}

main()
