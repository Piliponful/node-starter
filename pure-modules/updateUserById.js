const { ObjectID } = require('mongodb')

const updateUserById = ({ DBFunctions: { user } }, { userId, fieldsToUpdate }) => user.update({ _id: ObjectID(userId) }, { $set: fieldsToUpdate })

module.exports = { updateUserById }
