const userFunctions = require('./user')
const tenantFunctions = require('./tenant')
const DXFFileFunctions = require('./dxfFile')
const anotationFunctions = require('./anotation')

module.exports = [...userFunctions, ...tenantFunctions, ...DXFFileFunctions, anotationFunctions]
