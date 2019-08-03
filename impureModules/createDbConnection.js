const MongoClient = require('mongodb').MongoClient
const config = require('config')

const createDbConnection = async () => {
  const url = `mongodb://${config.db.username}:${config.db.password}@mongodb:27017`

  const client = new MongoClient(url, { useNewUrlParser: true })

  await client.connect()

  const db = client.db(config.db.name)

  return { db }
}

module.exports = { createDbConnection }
