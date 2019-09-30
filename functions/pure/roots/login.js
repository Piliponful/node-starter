const { getJwtFromUser } = require('./getJwtFromUser')

const login = async ({ withSidEffects: { db }, input: { password, email } }) => {
  const usersCollection = db.collection('users')

  const { errors: passwordMatchErrors, value: passwordMatch } = await usersCollection.doesPasswordMatch(email, password)

  if (passwordMatchErrors.length) {
    return { errors: passwordMatchErrors }
  }

  if (!passwordMatch) {
    return { errors: ['Your password doesn\'t match'] }
  }

  return getJwtFromUser(email)
}

module.exports = { login }
