const login = async ({ DBFunctions }, { password, email }) => {
  const { user } = DBFunctions

  const { errors: passwordMatchErrors, value: passwordMatch } = await user.doesPasswordMatch(email, password)

  if (passwordMatchErrors.length) {
    return { errors: passwordMatchErrors }
  }

  if (!passwordMatch) {
    return { errors: ['Your password doesn\'t match'] }
  }

  return user.getJWTFromUser(email)
}

module.exports = { login }
