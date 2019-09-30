const joi = require('joi')
const joiPhoneNumber = require('joi-phone-number')

joi.extend(joiPhoneNumber)

const userFieldsCheck = {
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

const validateUser = async ({ input: { userFields } }) => {
  const { error } = joi.validate(userFields, userFieldsCheck)

  if (error) {
    return { errors: error.details.map(d => d.message) }
  }

  return true
}

module.exports = { validateUser }
