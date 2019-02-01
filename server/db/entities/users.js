const joi = require('joi')
const db = require('../connection')

const userSchema = joi.object().keys({
  username: joi.string().alphanum().min(3).max(20).required(),
  password: joi.string().min(6).max(50).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required()
})

const create = user => db.collection('users').insertOne(user)
const find = (query, limit, skip, projection) => db.collection('users').find(query, { limit, skip, projection })
const update = (query, fields, createIfAbsent) => db.collection('users').updateOne(query, fields, { upsert: createIfAbsent })
const delete = query => db.collection('users').deleteOne(query)


module.exports = {
  validate: user => joi.validate(user, userSchema),
  create,
  find,
  update,
  delete
}
