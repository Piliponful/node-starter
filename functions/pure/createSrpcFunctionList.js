const { createAnotation } = require('./createAnotation')
const { createDxfFile } = require('./createDxfFile')
const { createUser } = require('./createUser')

const { deleteAnotation } = require('./deleteAnotation')
const { deleteDxfFileById } = require('./deleteDxfFileById')
const { deleteUserById } = require('./deleteUserById')

const { findAnotationById } = require('./findAnotationById')
const { findAnotations } = require('./findAnotations')

const { findDxfFileById } = require('./findDxfFileById')
const { findDxfFiles } = require('./findDxfFiles')

const { findTenantById } = require('./findTenantById')
const { findTenantByName } = require('./findTenantByName')
const { findTenants } = require('./findTenants')

const { findUserById } = require('./findUserById')
const { findUsers } = require('./findUsers')

const { finishUserRegistration } = require('./finishUserRegistration')

const { updateTenantById } = require('./updateTenantById')
const { updateUserById } = require('./updateUserById')

const { login } = require('./login')

const createSrpcFunctionList = {
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

module.exports = { createSrpcFunctionList }
