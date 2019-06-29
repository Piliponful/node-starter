const config = require('config')
const { decode } = require('jwt-simple')

const getUserFromJWT = async ({ JWT }) => {
  if (!JWT) {
    return { errors: ['You have to supply jwt token'] }
  }

  return decode(JWT, config.app.secret)
}

module.exports = { getUserFromJWT }
