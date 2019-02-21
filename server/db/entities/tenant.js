const joi = require('joi')

const { db } = require('../../')
const logger = require('../../logger')

const tenantFields = {
  name: joi.string().min(3).max(20).required(),
  deleted: joi.boolean().default(false)
}

const tenantSchema = joi.object().keys(tenantFields)

const create = async user => {
  try {
    const { error, value } = tenantSchema.validate(user)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await (await db).collection('tenants').insertOne(value)
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => {
  try {
    const value = await (await db).collection('tenants').find(query, { limit, skip, projection }).toArray()
    return { errors: [], value }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const update = async (query, fields, createIfAbsent = false) => {
  try {
    await (await db).collection('tenants').updateMany(query, fields, { upsert: createIfAbsent })
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
