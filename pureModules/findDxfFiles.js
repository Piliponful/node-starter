const { ObjectID } = require('mongodb')

const findDxfFiles = async ({ withSideEffects: { db }, input: { tenantId } }) => {
  const dxfFile = db.collection('dxfFile')

  if (tenantId) {
    if (ObjectID.isValid(tenantId)) {
      return { errors: ['TenantId is invalid'] }
    }
  }

  return dxfFile.find({ deleted: false })
}

module.exports = { findDxfFiles }
