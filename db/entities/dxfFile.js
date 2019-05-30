const createDXFEntity = db => {
  const joi = require('joi')

  const dxfFields = {
    name: joi.string().min(3).max(100).required(),
    tenantId: joi.string().required(),
    createdAt: joi.date().default(Date.now, 'time of creation'),
    deleted: joi.boolean().default(false)
  }

  const { createEntity } = require('../entity')
  return createEntity(db, 'dxf', dxfFields)
}

module.exports = { createDXFEntity }