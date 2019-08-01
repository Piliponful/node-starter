const { compareSync } = require('bcrypt-nodejs')
const joi = require('joi').extend(require('joi-phone-number'))

const doesPasswordMatch = async ({ withSidEffects: { db }, input: { email, password } }) => {
  const userCollection = db.collection('user')

  const { error } = joi.validate({ password, email }, joi.object().keys({
    email: joi.string().email({ minDomainAtoms: 2 }).required(),
    password: joi.string().min(6).max(50).required()
  }))

  if (error) {
    return { errors: error.details.map(d => d.message) }
  }

  const { errors: findErrors, value: [user] = [] } = await userCollection.find({ email })

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
