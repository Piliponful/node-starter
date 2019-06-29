import joi from 'joi'

const anotationFields = {
  name: joi.string().min(3).max(100).required(),
  gridPoints: joi.array().items(joi.number().required(), joi.number().required()),
  dxfFileId: joi.string().required(),
  tenantId: joi.string().required(),
  createdBy: joi.string().required(),
  createdAt: joi.date().default(Date.now, 'time of creation'),
  deleted: joi.boolean().default(false)
}

module.exports = { anotationFields }
