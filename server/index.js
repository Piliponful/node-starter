const main = async () => {
  const { createDb } = require('./db/connection')
  const db = await createDb()

  const { createUserEntity } = require('./db/entities/user')
  const userEntity = await createUserEntity(db)

  const { createTenantEntity } = require('./db/entities/tenant')
  const tenantEntity = await createTenantEntity(db)

  const { createUserFunctions } = require('./functions/user')
  const userFunctions = await createUserFunctions({ userEntity, tenantEntity })

  const jayson = require('jayson')
  const server = jayson.server({
    add: (args, cb) => {}
  })

  server.http().listen(80)
}

main()
