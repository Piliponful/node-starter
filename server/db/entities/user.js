const joi = require('joi').extend(require('joi-phone-number'))
const { hashSync, compareSync } = require('bcrypt-nodejs')
const { decode, encode } = require('jwt-simple')
const config = require('config')

const db = require('../connection').initializeDB()
const logger = require('../../logger')

const additionalFields = {
  address: joi.string().min(5).max(200).required(),
  city: joi.string().min(5).max(200).required(),
  firstname: joi.string().min(5).max(200).required(),
  lastname: joi.string().min(5).max(200).required(),
  password: joi.string().min(6).max(50).required(),
  phoneNumber: joi.string().phoneNumber(),
  secretQuestionAnswer: joi.string(),
  secretQuestionId: joi.number(),
  state: joi.string().min(5).max(200).required()
}

const userFields = {
  firstname: joi.string().alphanum().min(3).max(20).required(),
  lastname: joi.string().alphanum().min(3).max(20).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  tenantId: joi.number().required(),

  tenantAdmin: joi.boolean().default(false),
  rootAdmin: joi.boolean().default(false),

  finishRegistrationCode: joi.string().required(),
  deleted: joi.boolean().default(false)
}
const userSchema = joi.object().keys(userFields)

const create = async user => {
  try {
    const { error } = userSchema.validate(user)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await (await db).collection('users').insertOne(user)
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => {
  try {
    return { value: (await db).collection('users').find(query, { limit, skip, projection }).toArray() }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}
const update = async (query, fields, createIfAbsent = false) => {
  try {
    (await db).collection('users').updateMany(query, fields, { upsert: createIfAbsent })
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const doesPasswordMatch = async (email, password) => {
  try {
    const { error } = joi.validate(password, additionalFields.password)

    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    const findByEmailRes = await findByEmail(email)

    if (findByEmailRes.errors) {
      return findByEmailRes
    }

    const { value: user } = findByEmailRes

    return { errors: [], value: compareSync(password, user.password) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity doesPasswordMatch function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const findByEmail = async email => {
  const user = (await find({ email }))[0]

  if (!user) {
    return { errors: ['Couldn\'t find user by the provided email'] }
  }

  return { errors: [], value: user }
}

const updateWithAdditionalFilds = async (finishRegistrationCode, fields) => {
  try {
    const { error } = joi.validate(fields, additionalFields)

    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    const user = (await find({ finishRegistrationCode }))[0]

    if (!user) {
      return { errors: ['Finish registration code isn\'t valid'] }
    }

    const hash = hashSync(fields.password)

    await update({ finishRegistrationCode }, { $set: { ...fields, password: hash }, $unset: { finishRegistrationCode: 1 } })
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity updateWithAdditionalFilds function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const getUserFromJWT = jwt => {
  try {
    const user = decode(jwt, config.app.secret)
    return { errors: [], value: user }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getUserFromJWT function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const getJWTFromUser = async email => {
  try {
    const user = (await find({ email }))[0]

    if (!user) {
      return { errors: ['Couldn\'t find user by the provided email'] }
    }
    return { errors: [], value: encode(user, config.app.secret) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity getJWTFromUser function')
    return { errors: ['Internal server error has occurred'] }
  }
}

module.exports = {
  create,
  find,
  update,
  doesPasswordMatch,
  getUserFromJWT,
  getJWTFromUser,
  updateWithAdditionalFilds
}
