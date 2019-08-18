const { callFunction } = require('srpc-framework/pureModules/callFunction')

const callFunctionWithErrorHandling = (args) => {
  const { withSideEffects: { logger } } = args

  try {
    return callFunction(args)
  } catch (e) {
    logger.error(e)

    return { errors: ['Internal Server Error'] }
  }
}

module.exports = { callFunctionWithErrorHandling }
