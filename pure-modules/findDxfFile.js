const { ObjectID } = require('mongodb')

const findDxfFile = async ({ DBFunctions: { DXFFile }, tenantId }) => {
  if (!tenantId) {
    if (ObjectID.isValid(tenantId)) {
      return { errors: ['TenantId is invalid'] }
    }
  }

  return DXFFile.find({ deleted: false })
}

module.exports = { findDxfFile }
