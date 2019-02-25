const logger = require('../logger')

const handleInternalError = (fn, msg) => (...args) => {
  try {
    return fn(...args)
  } catch (error) {
    logger.error(error, msg)
    return { errors: ['Internal server error has occurred'] }
  }
}

module.exports = { handleInternalError }
