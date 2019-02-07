const createIndexes = db => db.collection('users').createIndex({ email: 1 }, { unique: true })

module.exports = { createIndexes }
