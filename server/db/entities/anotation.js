const joi = require('joi')
const config = require('config')

const db = require('../connection')

const { validate } = joi.object().keys({
  filepath: joi.string().alphanum().min(3).max(20).required(),
  filename: joi.string().min(6).max(50).required(),
  createdAt: joi.date().default(Date.now)
})

const create = async user => {
  const { error } = validate()

  const hash = bcrypt.hashSync(user.password)

  if (!error) {
    await db.collection('users').insertOne(user)
  }

  return { error }
}
const find = (query, limit = 0, skip = 0, projection) => db.collection('users').find(query, { limit, skip, projection })
const update = (query, fields, createIfAbsent) => db.collection('users').updateOne(query, fields, { upsert: createIfAbsent })
const remove = query => db.collection('users').deleteOne(query)

module.exports = {
  create,
  find,
  update,
  remove
}
