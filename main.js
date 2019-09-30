const { createHttpSrpcServer } = require('srpc-framework/functions/impure/createHttpSrpcServer')

const { createSrpcFunctionList } = require('./functions/pure/createSrpcFunctionList')
const { callFunctionWithImpureFunctions: callFunction } = require('./functions/pure/callFunctionWithImpureFunctions')

const port = 8080
const onStartText = `Server successfully launched on port ${port}`
const functions = createSrpcFunctionList()

createHttpSrpcServer({
  callFunction,
  functions,
  port,
  onStartText
})
