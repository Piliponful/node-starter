const { compareSync } = require('bcrypt-nodejs')
const joi = require('joi').extend(require('joi-phone-number'))

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

const additionalFields = {
  address: joi.string().min(5).max(200).required(),
  city: joi.string().min(5).max(200).required(),
  state: joi.string().min(5).max(200).required(),

  firstname: joi.string().min(5).max(20),
  lastname: joi.string().min(5).max(20),
  phoneNumber: joi.string().phoneNumber(),

  password: joi.string().min(6).max(50).required(),
  secretQuestionAnswer: joi.string(),
  secretQuestionId: joi.number()
}

const doesPasswordMatch = async ({ withSideEffects: { DB }, input: { email, password } }) => {
  const userDBFunctions = DB.collection('users')

  const { error } = joi.validate({ password, email }, joi.object().keys({ email: userFields.email, password: additionalFields.password }))

  if (error) {
    return { errors: error.details.map(d => d.message) }
  }

  const { errors: findErrors, value: [user] = [] } = await userDBFunctions.find({ email })

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

module.exports = { doesPasswordMatch }
