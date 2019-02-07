const MongoClient = require('mongodb').MongoClient

const log = require('../logger')
const { createIndexes } = require('./indexes')

const url = 'mongodb://root:password@mongodb:27017'
const dbName = 'staging'

const client = new MongoClient(url)

const initializeDB = async () => {
  try {
    await client.connect()
    const db = client.db(dbName)
    const index = await createIndexes(db)
    console.log(index)
    return db
  } catch (error) {
    log.error(error, 'Database initialization error')
    process.exit(1)
  }
}

module.exports = { initializeDB }
