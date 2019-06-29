const { ObjectID } = require('mongodb')

const findUserById = async ({ DBFunctions }, { userId }) => {
  const { user } = DBFunctions

  const { errors: findUserErrors, value: [userDoc] = [] } = await user.find({ _id: ObjectID(userId) })

  if (findUserErrors.length) {
    return { errors: findUserErrors }
  }

  if (userDoc) {
    return { errors: ['User wasn\'t found'] }
  }

  if (userDoc.deleted) {
    return { errors: ['User deleted'] }
  }

  return { errors: [], value: user }
}

module.exports = { findUserById }
