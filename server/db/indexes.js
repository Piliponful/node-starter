const createIndexes = db => {
  db.collection('users').createIndex({ email: 1 }, { unique: true })
  db.collection('tenants').createIndex({ name: 1 }, { unique: true })
  db.collection('dxffiles').createIndex({ name: 1 }, { unique: true })
}

module.exports = { createIndexes }
