const { createSrpcServer } = require('srpc-framework/impureModules/createSrpcServer')

const { callFunction } = require('./pureModules/createFunctionCaller')

const { createSrpcFunctionList } = require('./pureModules/createSrpcFunctionList')

const { createSideEffects } = require('./impureModules/createSideEffects')

const callFunctionWithSideEffects = async ({ functions, jsonString }) => {
  const withSideEffects = await createSideEffects()

  const functionsWithSideEffects = Object.entries(functions)
    .reduce((funcMap, [funcName, func]) => {
      funcMap[funcName] = input => func({ withSideEffects, input })
    }, {})

  return callFunction({ functions: functionsWithSideEffects, jsonString })
}

const port = 8080
const onStartText = `Server successfully launched on port ${port}`
const functions = createSrpcFunctionList()

createSrpcServer({
  callFunction: callFunctionWithSideEffects,
  functions,
  port,
  onStartText
})
