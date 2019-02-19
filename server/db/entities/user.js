const joi = require('joi').extend(require('joi-phone-number'))
const { hashSync, compareSync } = require('bcrypt-nodejs')
const { decode, encode } = require('jwt-simple')
const config = require('config')

const { db } = require('../../')
const logger = require('../../logger')

const additionalFields = {
  // geo
  address: joi.string().min(5).max(200).required(),
  city: joi.string().min(5).max(200).required(),
  state: joi.string().min(5).max(200).required(),

  // basic
  firstname: joi.string().min(5).max(200).required(),
  lastname: joi.string().min(5).max(200).required(),
  phoneNumber: joi.string().phoneNumber(),

  // secret
  password: joi.string().min(6).max(50).required(),
  secretQuestionAnswer: joi.string(),
  secretQuestionId: joi.number(),
}

const userFields = {
  firstname: joi.string().alphanum().min(3).max(20).required(),
  lastname: joi.string().alphanum().min(3).max(20).required(),
  email: joi.string().email({ minDomainAtoms: 2 }).required(),
  tenantId: joi.string().required(),

  tenantAdmin: joi.boolean().default(false),
  rootAdmin: joi.boolean().default(false),

  finishRegistrationCode: joi.string().required(),
  deleted: joi.boolean().default(false)
}

const userSchema = joi.object().keys(userFields)

const create = async user => {
  try {
    const { error, value } = userSchema.validate(user)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await (await db).collection('users').insertOne(value)
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => {
  try {
    const value = await (await db).collection('users').find(query, { limit, skip, projection }).toArray()
    return { errors: [], value }
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

    const { errors: findByEmailErrors, value: user } = await findByEmail(email)

    if (findByEmailErrors.length) {
      return { errors: findByEmailErrors }
    }

    return { errors: [], value: compareSync(password, user.password) }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity doesPasswordMatch function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const findByEmail = async email => {
  const { errors: findErrors, value: users } = await find({ email })

  if (findErrors.length) {
    return { errors: findErrors }
  }

  const [user] = users

  if (!user) {
    return { errors: ['Couldn\'t find user by the provided email'] }
  }

  return { errors: [], value: user }
}

const updateWithAdditionalFilds = async (finishRegistrationCode, fields) => {
  try {
    const errors = await validate()

    if (errors.length) {
      return { errors }
    }

    await update({ finishRegistrationCode }, {
      $set: {
        ...fields,
        password: hashSync(fields.password),
        deleted: false,
      },
      $unset: { finishRegistrationCode: 1 },
    })

    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity updateWithAdditionalFilds function')
    return { errors: ['Internal server error has occurred'] }
  }

  async function validate() {
    const { error } = joi.validate(fields, additionalFields)

    if (error) {
      return error.details.map(d => d.message)
    }

    const { errors, value: [user] = [] } = await find({ finishRegistrationCode })

    if (errors.length) {
      return errors
    }

    if (!user) {
      return ['Finish registration code isn\'t valid']
    }
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
    const { errors: findErrors, value: users } = (await find({ email }))

    if (findErrors.length) {
      return { errors: findErrors }
    }

    const [user] = users

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
