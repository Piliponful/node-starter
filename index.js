const {
  filthyModules: {
    SRPCServer: {
      createSRPCServer
    }
  }, pureModules: {
    functionCaller: {
      createFunctionCaller
    }
  }
} = require('srpc-framework')

const functions = require('./functions')
