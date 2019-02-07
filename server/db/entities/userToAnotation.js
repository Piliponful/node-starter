const joi = require('joi')
const config = require('config')

const db = require('../connection')

const { validate } = joi.object().keys({
  anotationId: joi.number().required(),
  userId: joi.number().required()
})

const create = async userToAnotation => {
  const { error } = validate(userToAnotation)

  if (!error) {
    await db.collection('userToAnotation').insertOne(userToAnotation)
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
