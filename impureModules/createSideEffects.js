const { createDbConnection } = require('./createDbConnection')
const { createLogger } = require('./createLogger')
const { createS3 } = require('./createS3')

const createSideEffects = async () => {
  const logger = createLogger()
  const s3 = createS3()
  const db = await createDbConnection()

  return { db, logger, s3 }
}

module.exports = { createSideEffects }
