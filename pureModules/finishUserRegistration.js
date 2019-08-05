const { hashSync } = require('bcrypt-nodejs')
const joi = require('joi')

const finishUserRegistration = async ({ withSidEffects: { db }, input: { finishRegistrationCode, fields } }) => {
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

  const usersCollection = db.collection('users')

  const { error } = joi.validate(fields, additionalFields)

  if (error) {
    return { errors: error.details.map(d => d.message) }
  }

  const { errors, value: [user] = [] } = await usersCollection.find({ finishRegistrationCode })

  if (errors.length) {
    return { errors }
  }

  if (!user) {
    return { errors: ['Finish registration code isn\'t valid'] }
  }

  await usersCollection.update({ finishRegistrationCode }, {
    $set: {
      ...fields,
      password: hashSync(fields.password),
      deleted: false
    },
    $unset: { finishRegistrationCode: 1 }
  })

  return { value: true }
}

module.exports = { finishUserRegistration }
