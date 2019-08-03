const addIndexesToDb = ({ db }) => {
  db.collection('users').createIndex({ email: 1 }, { unique: true })
  db.collection('tenants').createIndex({ name: 1 }, { unique: true })

  return db
}

module.exports = { addIndexesToDb }
