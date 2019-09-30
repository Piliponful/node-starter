const { callFunction } = require('srpc-framework/functions/pure/callFunction')

const callFunctionWithErrorHandling = (args) => {
  const { impureFunctions: { createLogger } } = args

  try {
    return callFunction(args)
  } catch (e) {
    const logger = createLogger()
    logger.error(e)

    return { errors: ['Internal Server Error'] }
  }
}

module.exports = { callFunctionWithErrorHandling }
