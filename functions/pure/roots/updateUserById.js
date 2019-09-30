const { ObjectID } = require('mongodb')

const updateUserById = async ({ withSidEffects: { db }, input: { userId, fieldsToUpdate } }) => {
  const usersCollection = db.collection('users')

  await usersCollection.update({ _id: ObjectID(userId) }, { $set: fieldsToUpdate })

  return { value: true }
}

module.exports = { updateUserById }
