const joi = require('joi')
const config = require('config')

const db = require('../connection')

const { validate } = joi.object().keys({
  tenantId: joi.string().alphanum().min(3).max(20).required(),
  anotationId: joi.string().min(6).max(50).required()
})

const create = async tenantToAnotation => {
  const { error } = validate()

  if (!error) {
    await db.collection('tenantToAnotation').insertOne(tenantToAnotation)
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
