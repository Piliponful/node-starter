const MongoClient = require('mongodb').MongoClient
const path = require('path')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'arialpoint-server', streams: [{ path: path.resolve(__dirname, 'log') }] })

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
