const joi = require('joi')

const logger = require('../../logger')
const { db } = require('../../')

const dxfFields = {
  name: joi.string().min(3).max(100).required(),
  tenantId: joi.string().required(),
  createdAt: joi.date().default(Date.now, 'time of creation'),
  deleted: joi.boolean().default(false)
}

const dxfSchema = joi.object().keys(dxfFields)

const create = async user => {
  try {
    const { error, value } = dxfSchema.validate(user)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await (await db).collection('dxffiles').insertOne(value)
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => {
  try {
    const value = await (await db).collection('dxffiles').find(query, { limit, skip, projection }).toArray()
    return { errors: [], value }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const update = async (query, fields, createIfAbsent = false) => {
  try {
    await (await db).collection('dxffiles').updateMany(query, fields, { upsert: createIfAbsent })
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}

module.exports = {
  create,
  find,
  update
}
