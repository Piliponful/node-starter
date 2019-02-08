const joi = require('joi').extend(require('joi-phone-number'))
const { hashSync, compareSync } = require('bcrypt-nodejs')
const { decode, encode } = require('jwt-simple')
const config = require('config')

const db = require('../connection').initializeDB()
const logger = require('../../logger')

const userFields = {
  firstname: joi.string().alphanum().min(3).max(20).required(),
  lastname: joi.string().alphanum().min(3).max(20).required(),
  password: joi.string().min(6).max(50).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  tenantId: joi.number().required(),

  phoneNumber: joi.string().phoneNumber(),
  address: joi.string().min(5).max(200),
  city: joi.string().min(5).max(200),
  state: joi.string().min(5).max(200),
  secretQuestionId: joi.number(),
  secretQuestionAnswer: joi.string(),

  tenantAdmin: joi.boolean().default(false),
  rootAdmin: joi.boolean().default(false)
}
const userSchema = joi.object().keys(userFields)

const create = async user => {
  try {
    const { error } = userSchema.validate()

    if (error) {
      return { error: { external: error } }
    }

    const hash = hashSync(user.password)
    await (await db).collection('users').insertOne({ ...user, password: hash })
    return { error: {} }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { error: { internal: error, external: 'Internal server error has occurred' } }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => (await db).collection('users').find(query, { limit, skip, projection }).toArray()
const update = async (query, fields, createIfAbsent) => (await db).collection('users').updateOne(query, fields, { upsert: createIfAbsent })
const remove = async query => (await db).collection('users').deleteOne(query)

const doesPasswordMatch = async (email, password) => {
  try {
    const { error } = joi.validate(password, userSchema.password)

    if (error) {
      return { error: { external: error } }
    }

    const user = (await find({ email }))[0]

    if (!user) {
      return { error: { external: 'Couldn\'t find user by the provided email' } }
    }

    return { error: {}, value: compareSync(password, user.password) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity doesPasswordMatch function')
    return { error: { internal: error, external: 'Internat server error has occurred' } }
  }
}

const getUserFromJWT = jwt => {
  try {
    const user = decode(jwt, config.secret)
    return { error: {}, value: user }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getUserFromJWT function')
    return { error: { internal: error, external: 'Internat server error has occurred' } }
  }
}

const getJWTFromUser = async email => {
  try {
    const user = (await find({ email }))[0]

    if (!user) {
      return { error: { external: 'Couldn\'t find user by the provided email' } }
    }
    return { error: {}, value: encode(user, config.secret) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getJWTFromUser function')
    return { error: { internal: error, external: 'Internat server error has occurred' } }
  }
}

module.exports = {
  create,
  find,
  update,
  remove,
  doesPasswordMatch,
  getUserFromJWT,
  getJWTFromUser
}
