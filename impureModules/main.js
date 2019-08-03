const { createSrpcServer } = require('srpc-framework/impureModules/createSrpcServer')
const { createFunctionCaller } = require('srpc-framework/pureModules/createFunctionCaller')
const { pCompose } = require('../pureModules/pCompose')

const { createDbConnection } = require('./createDbConnection')
const { addIndexesToDb } = require('./addIndexesToDb')
const { createLogger } = require('./createLogger')
const { createS3 } = require('./createS3')

const db = pCompose(addIndexesToDb, createDbConnection)()
const logger = createLogger()
const s3 = createS3()

const withSideEffects = { db, logger, s3 }

const createFunctionCallerWithSideEffects = ({ functions, jsonString }) => {
  const functionsWithSideEffects = Object.entries(functions).reduce((funcList, [funcName, func]) => {
    funcList[funcName] = input => func({ withSideEffects, input })
  }, {})
  return createFunctionCaller({ functions: functionsWithSideEffects, jsonString })
}

const { createAnotation } = require('../pureModules/createAnotation')
const { createDxfFile } = require('../pureModules/createDxfFile')
const { createUser } = require('../pureModules/createUser')

const { deleteAnotation } = require('../pureModules/deleteAnotation')
const { deleteDxfFileById } = require('../pureModules/deleteDxfFileById')
const { deleteUserById } = require('../pureModules/deleteUserById')

const { findAnotationById } = require('../pureModules/findAnotationById')
const { findAnotations } = require('../pureModules/findAnotations')

const { findDxfFileById } = require('../pureModules/findDxfFile')
const { findDxfFiles } = require('../pureModules/findDxfFiles')

const { findTenantById } = require('../pureModules/findTenantById')
const { findTenantByName } = require('../pureModules/findTenantByName')
const { findTenants } = require('../pureModules/findTenants')

const { findUserById } = require('../pureModules/findUser')
const { findUsers } = require('../pureModules/findUsers')

const { finishUserRegistration } = require('../pureModules/finishUserRegistration')

const { updateTenantById } = require('../pureModules/updateTenantById')
const { updateUserById } = require('../pureModules/updateUserById')

const { login } = require('../pureModules/login')

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

createSrpcServer({
  createFunctionCaller: createFunctionCallerWithSideEffects,
  functions,
  port,
  onStartText
})
