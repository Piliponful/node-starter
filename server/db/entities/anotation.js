const joi = require('joi')

const logger = require('../../logger')
const { db } = require('../../')

const anotationFields = {
  name: joi.string().min(3).max(100).required(),
  gridPoints: joi.array().items(joi.number().required(), joi.number().required()),
  dxfFileId: joi.string().required(),
  createdBy: joi.string().required(),
  createdAt: joi.date().default(Date.now, 'time of creation'),
  deleted: joi.boolean().default(false)
}

const anotationSchema = joi.object().keys(anotationFields)

const create = async user => {
  try {
    const { error, value } = anotationSchema.validate(user)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await (await db).collection('anotations').insertOne(value)
    return { errors: [], value: true }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity create function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const find = async (query, limit = 0, skip = 0, projection) => {
  try {
    const value = await (await db).collection('anotations').find(query, { limit, skip, projection }).toArray()
    return { errors: [], value }
  } catch (error) {
    logger.error(error, 'Something wrong in User entity find function')
    return { errors: ['Internal server error has occurred'] }
  }
}

const update = async (query, fields, createIfAbsent = false) => {
  try {
    await (await db).collection('anotations').updateMany(query, fields, { upsert: createIfAbsent })
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
