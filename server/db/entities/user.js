const createUserEntity = db => {
  const joi = require('joi').extend(require('joi-phone-number'))

  const additionalFields = {
    address: joi.string().min(5).max(200).required(),
    city: joi.string().min(5).max(200).required(),
    state: joi.string().min(5).max(200).required(),

    firstname: joi.string().min(5).max(200).required(),
    lastname: joi.string().min(5).max(200).required(),
    phoneNumber: joi.string().phoneNumber(),

    password: joi.string().min(6).max(50).required(),
    secretQuestionAnswer: joi.string(),
    secretQuestionId: joi.number()
  }

  const userFields = {
    firstname: joi.string().alphanum().min(3).max(20).required(),
    lastname: joi.string().alphanum().min(3).max(20).required(),
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    tenantId: joi.string().required(),
    tenant: joi.object(),

    tenantAdmin: joi.boolean().default(false),
    rootAdmin: joi.boolean().default(false),

    finishRegistrationCode: joi.string().required(),
    deleted: joi.boolean().default(false)
  }

  const createSpecificFunctions = baseFunctions => {
    const config = require('config')
    const { hashSync, compareSync } = require('bcrypt-nodejs')
    const { decode, encode } = require('jwt-simple')

    const doesPasswordMatch = async (email, password) => {
      const { error } = joi.validate({ password, email }, joi.object().keys({ email: userFields.email, password: additionalFields.password }))

      if (error) {
        return { errors: error.details.map(d => d.message) }
      }

      const { errors: findErrors, value: [user] = [] } = await baseFunctions.find({ email })

      if (findErrors.length) {
        return { errors: findErrors }
      }

      if (!user) {
        return { errors: ['Couldn\'t find user by the provided email'] }
      }

      if (user.finishRegistrationCode) {
        return { errors: ['You need to finish your registration process'] }
      }

      return { errors: [], value: compareSync(password, user.password) }
    }

    const updateWithAdditionalFilds = async (finishRegistrationCode, fields) => {
      const { error } = joi.validate(fields, additionalFields)

      if (error) {
        return { errors: error.details.map(d => d.message) }
      }

      const { errors, value: [user] = [] } = await baseFunctions.find({ finishRegistrationCode })

      if (errors.length) {
        return { errors }
      }

      if (!user) {
        return { errors: ['Finish registration code isn\'t valid'] }
      }

      await baseFunctions.update({ finishRegistrationCode }, {
        $set: {
          ...fields,
          password: hashSync(fields.password),
          deleted: false
        },
        $unset: { finishRegistrationCode: 1 }
      })

      return { errors: [], value: true }
    }

    const getUserFromJWT = jwt => {
      const user = decode(jwt, config.app.secret)

      return { errors: [], value: user }
    }

    const getJWTFromUser = async email => {
      const { errors: findErrors, value: users } = await baseFunctions.find({ email })

      if (findErrors.length) {
        return { errors: findErrors }
      }

      const [user] = users

      if (!user) {
        return { errors: ['Couldn\'t find user by the provided email'] }
      }

      return { errors: [], value: encode(user, config.app.secret) }
    }

    return {
      doesPasswordMatch,
      getUserFromJWT,
      getJWTFromUser,
      updateWithAdditionalFilds
    }
  }

  const { createEntity } = require('../entity')
  return createEntity(db, 'user', userFields, createSpecificFunctions)
}

module.exports = { createUserEntity }
