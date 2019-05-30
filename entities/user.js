const JWTToUser = ({ user }, { JWT }) => {
  if (!JWT) {
    return { errors: ['You have to supply jwt token'] }
  }

  const { errors: getUserFromJWTErrors, value: caller } = user.getUserFromJWT(JWT)

  if (getUserFromJWTErrors.length) {
    return { errors: getUserFromJWTErrors }
  }

  return caller
}

module.exports = { JWTToUser }
