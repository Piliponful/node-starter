const main = async () => {
  const { createDb } = require('./db/connection')
  const db = await createDb()

  const { createUserEntity } = require('./db/entities/user')
  const userEntity = await createUserEntity(db)

  const { createTenantEntity } = require('./db/entities/tenant')
  const tenantEntity = await createTenantEntity(db)

  const jayson = require('jayson')
  const server = jayson.server({})

  server.http().listen(80)
}

main()
