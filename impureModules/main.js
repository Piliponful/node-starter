const { createSrpcServer } = require('srpc-framework/impureModules/createSrpcServer')
const { callFunction } = require('srpc-framework/pureModules/createFunctionCaller')

const { createAnotation } = require('../pureModules/createAnotation')
const { createDxfFile } = require('../pureModules/createDxfFile')
const { createUser } = require('../pureModules/createUser')

const { deleteAnotation } = require('../pureModules/deleteAnotation')
const { deleteDxfFileById } = require('../pureModules/deleteDxfFileById')
const { deleteUserById } = require('../pureModules/deleteUserById')

const { findAnotationById } = require('../pureModules/findAnotationById')
const { findAnotations } = require('../pureModules/findAnotations')

const { findDxfFileById } = require('../pureModules/findDxfFileById')
const { findDxfFiles } = require('../pureModules/findDxfFiles')

const { findTenantById } = require('../pureModules/findTenantById')
const { findTenantByName } = require('../pureModules/findTenantByName')
const { findTenants } = require('../pureModules/findTenants')

const { findUserById } = require('../pureModules/findUserById')
const { findUsers } = require('../pureModules/findUsers')

const { finishUserRegistration } = require('../pureModules/finishUserRegistration')

const { updateTenantById } = require('../pureModules/updateTenantById')
const { updateUserById } = require('../pureModules/updateUserById')

const { login } = require('../pureModules/login')

const { createSideEffects } = require('./createSideEffects')

const functions = {
  createAnotation,
  createDxfFile,
  createUser,

  deleteAnotation,
  deleteDxfFileById,
  deleteUserById,

  findAnotationById,
  findAnotations,

  findDxfFileById,
  findDxfFiles,

  findTenantById,
  findTenantByName,
  findTenants,

  findUserById,
  findUsers,

  finishUserRegistration,

  updateTenantById,
  updateUserById,

  login
}

const port = 8080
const onStartText = `Server successfully launched on port ${port}`

const callFunctionWithSideEffects = async ({ functions, jsonString }) => {
  const withSideEffects = await createSideEffects()

  const functionsWithSideEffects = Object.entries(functions)
    .reduce((funcList, [funcName, func]) => {
      funcList[funcName] = input => func({ withSideEffects, input })
    }, {})

  return callFunction({ functions: functionsWithSideEffects, jsonString })
}

createSrpcServer({
  callFunction: callFunctionWithSideEffects,
  functions,
  port,
  onStartText
})
