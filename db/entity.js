const { handleInternalError } = require('./handle-error')
const wrap = (fnObject, entityName) => Object.keys(fnObject).reduce((acc, next) => {
  return { ...acc, [next]: handleInternalError(fnObject[next], `Something went wrong in ${entityName} entity ${next} function`) }
}, {})

const createEntity = async (db, entityName, fields, createSpecificFunctions) => {
  const joi = require('joi')
  const { ObjectId } = require('mongodb')

  const schema = joi.object().keys(fields)
  const entity = db.collection(entityName.toLowerCase())

  const create = async newEntity => {
    const { error, value } = schema.validate(newEntity)
    if (error) {
      return { errors: error.details.map(d => d.message) }
    }

    await entity.insertOne(value)
    return { errors: [], value: true }
  }

  const find = async (query, limit = 0, skip = 0, projection) => {
    const value = await entity.find(query, { limit, skip, projection }).toArray()
    return { errors: [], value }
  }

  const count = async query => {
    const entityCount = await entity.count(query)
    return { errors: [], value: entityCount }
  }

  const update = async (query, fields, createIfAbsent = false) => {
    await entity.updateMany(query, fields, { upsert: createIfAbsent })
    return { errors: [], value: true }
  }

  const remove = id => entity.update({ _id: ObjectId(id) }, { $set: { deleted: true } })

  const baseFunctions = wrap({
    create,
    find,
    count,
    update,
    remove
  }, entityName)

  return createSpecificFunctions ? {
    ...baseFunctions,
    ...wrap(createSpecificFunctions(baseFunctions))
  } : baseFunctions
}

module.exports = {
  createEntity
}
