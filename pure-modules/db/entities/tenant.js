const joi = require('joi')

const tenantFields = {
  name: joi.string().min(3).max(20).required(),
  deleted: joi.boolean().default(false)
}

module.exports = { tenantFields }
