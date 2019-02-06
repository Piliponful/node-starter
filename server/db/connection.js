const MongoClient = require('mongodb').MongoClient
const log = require('../logger')

const url = 'mongodb://mongodb:27017'
const dbName = 'arialpoint'

const client = new MongoClient(url)

const initDB = async () => {
  try {
    await client.connect()
  } catch (e) {
    log.error({ url, error: e }, 'Error connecting to the database')
    process.exit(1)
  }
  return client.db(dbName)
}

module.exports = initDB()
