const MongoClient = require('mongodb').MongoClient
const config = require('config')

const logger = require('../logger')
const { createIndexes } = require('./indexes')

const url = `mongodb://${config.db.username}:${config.db.password}@mongodb:27017`

const client = new MongoClient(url, { useNewUrlParser: true })

const createDb = async () => {
  try {
    await client.connect()
    const db = client.db(config.db.name)

    const indexedFields = await createIndexes(db)
    logger.info(indexedFields, 'Indexes applied to mongodb')

    return db
  } catch (error) {
    logger.error(error, 'Database initialization error')
    process.exit(1)
  }
}

module.exports = { createDb }
