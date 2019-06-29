const { ObjectID } = require('mongodb')

const deleteUserById = ({ DBFunctions: { user } }, { userId }) => user.update({ _id: ObjectID(userId) }, { $set: { deleted: true } })

module.exports = { deleteUserById }
