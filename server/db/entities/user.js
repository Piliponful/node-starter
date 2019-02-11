const joi = require('joi').extend(require('joi-phone-number'))
const { hashSync, compareSync } = require('bcrypt-nodejs')
const { decode, encode } = require('jwt-simple')
const config = require('config')

const db = require('../connection').initializeDB()
const logger = require('../../logger')

const additionalFields = {
  address: joi.string().min(5).max(200).required(),
  city: joi.string().min(5).max(200).required(),
  state: joi.string().min(5).max(200).required(),
  password: joi.string().min(6).max(50).required(),

  phoneNumber: joi.string().phoneNumber(),
  secretQuestionId: joi.number(),
  secretQuestionAnswer: joi.string()
}

const userFields = {
  firstname: joi.string().alphanum().min(3).max(20).required(),
  lastname: joi.string().alphanum().min(3).max(20).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  tenantId: joi.number().required(),

  tenantAdmin: joi.boolean().default(false),
  rootAdmin: joi.boolean().default(false),

  finishRegistrationCode: joi.string().required()
}
const userSchema = joi.object().keys(userFields)

const create = async user => {
  try {
    const { error } = userSchema.validate(user)
    if (error) {
      return { error: error.details[0].message }
    }

    await (await db).collection('users').insertOne(user)
    return { value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { error: 'Internal server error has occurred' }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => (await db).collection('users').find(query, { limit, skip, projection }).toArray()
const update = async (query, fields, createIfAbsent = false) => (await db).collection('users').updateMany(query, fields, { upsert: createIfAbsent })
const remove = async query => (await db).collection('users').deleteOne(query)

const doesPasswordMatch = async (email, password) => {
  try {
    const { error } = joi.validate(password, additionalFields.password)

    if (error) {
      return { error: error.details.message }
    }

    const findByEmailRes = await findByEmail(email)

    if (findByEmailRes.error) {
      return findByEmailRes
    }

    const { value: user } = findByEmailRes

    return { value: compareSync(password, user.password) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity doesPasswordMatch function')
    return { error: 'Internal server error has occurred' }
  }
}

const findByEmail = async email => {
  const user = (await find({ email }))[0]

  if (!user) {
    return { error: 'Couldn\'t find user by the provided email' }
  }

  return { value: user }
}

const updateWithAdditionalFilds = async (finishRegistrationCode, fields) => {
  try {
    const { error } = joi.validate(fields, additionalFields)

    if (error) {
      return { error: error.details.message }
    }

    const user = (await find({ finishRegistrationCode }))[0]

    if (!user) {
      return { error: 'Finish registration code isn\'t valid' }
    }

    const hash = hashSync(fields.password)

    await update({ finishRegistrationCode }, { $set: { ...fields, password: hash }, $unset: { finishRegistrationCode: 1 } })
    return { value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity updateWithAdditionalFilds function')
    return { error: 'Internal server error has occurred' }
  }
}

const getUserFromJWT = jwt => {
  try {
    const user = decode(jwt, config.app.secret)
    return { value: user }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getUserFromJWT function')
    return { error: 'Internal server error has occurred' }
  }
}

const getJWTFromUser = async email => {
  try {
    const user = (await find({ email }))[0]

    if (!user) {
      return { error: 'Couldn\'t find user by the provided email' }
    }
    return { value: encode(user, config.app.secret) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getJWTFromUser function')
    return { error: 'Internal server error has occurred' }
  }
}

module.exports = {
  create,
  find,
  update,
  remove,
  doesPasswordMatch,
  getUserFromJWT,
  getJWTFromUser,
  updateWithAdditionalFilds
}
