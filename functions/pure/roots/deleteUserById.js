const { ObjectID } = require('mongodb')

const deleteUserById = async ({ withSideEffects: { db }, input: { userId } }) => {
  const userCollection = db.collection('user')

  await userCollection.update({ _id: ObjectID(userId) }, { $set: { deleted: true } })

  return { value: true }
}

module.exports = { deleteUserById }
