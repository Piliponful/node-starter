const joi = require('joi')

const dxfFileFieldsCheck = {
  name: joi.string().min(3).max(100).required(),
  tenantId: joi.string().required(),
  createdAt: joi.date().default(Date.now, 'time of creation'),
  deleted: joi.boolean().default(false)
}

const validateDxfFile = async ({ input: { userFields } }) => {
  const { error } = joi.validate(userFields, dxfFileFieldsCheck)

  if (error) {
    return { errors: error.details.map(d => d.message) }
  }

  return true
}

module.exports = { validateDxfFile }
