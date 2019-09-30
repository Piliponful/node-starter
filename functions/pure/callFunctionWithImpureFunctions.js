const { callFunctionWithErrorHandling } = require('./callFunctionWithErrorHandling')

const { createDbConnection } = require('../impure/createDbConnection')
const { createLogger } = require('../impure/createDbConnection')
const { createS3 } = require('../impure/createS3')

const callFunctionWithImpureFunctions = ({ functions, jsonString }) => {
  const impureFunctions = { createDbConnection, createLogger, createS3 }

  const functionsWithImpureFunctions = Object.entries(functions)
    .reduce((funcMap, [funcName, func]) => {
      funcMap[funcName] = input => func({ impureFunctions, input })
    }, {})

  const callFunction = callFunctionWithErrorHandling({ impureFunctions: { createLogger } })

  return callFunction({ functions: functionsWithImpureFunctions, jsonString })
}

module.exports = { callFunctionWithImpureFunctions }
