const config = require('config')
const { decode } = require('jwt-simple')

const getUserFromJwt = async ({ input: { jwt } }) => {
  if (!jwt) {
    return { errors: ['You have to supply jwt token'] }
  }

  return { value: decode(jwt, config.app.secret) }
}

module.exports = { getUserFromJwt }
