const config = require('config')
const { encode } = require('jwt-simple')

const getJwtFromUser = async ({ withSidEffects: { db } }, { email }) => {
  const usersCollection = db.collection('users')

  const { errors: findErrors, value: users } = await usersCollection.find({ email })

  if (findErrors.length) {
    return { errors: findErrors }
  }

  const [user] = users

  if (!user) {
    return { errors: ['Couldn\'t find user by the provided email'] }
  }

  return { value: encode(user, config.app.secret) }
}

module.exports = { getJwtFromUser }
