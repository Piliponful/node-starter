const joi = require('joi')
const { hashSync, compareSync }  = require('bcrypt-nodejs')
const { decode, encode } = require('jwt-simple')
const config = require('config')

const db = require('../connection')

const { validate } = joi.object().keys({
  username: joi.string().alphanum().min(3).max(20).required(),
  password: joi.string().min(6).max(50).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  tenantAdmin: joi.boolean().default(false),
  rootAdmin: joi.boolean().default(false),
  tenantId: joi.number().optional()
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
const comparePasswords = (userId, password) => {
  const user = find({ userId })
  compareSync(password, user.password)
}
const getUserFromJWT = jwt => {
  const { userId } = decode(jwt, secret)
}
const getJWTFromUser = userId => {
  return encode({ userId }, config.secret)
}

module.exports = {
  create,
  find,
  update,
  remove,
  comparePasswords,
  getUserFromJWT,
  getJWTFromUser
}
