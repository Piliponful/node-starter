const path = require('path')
const bunyan = require('bunyan')

const createLogger = () => {
  return bunyan.createLogger({ name: 'arialpoint-server', streams: [{ path: path.resolve(__dirname, 'logs/log') }] })
}

module.exports = { createLogger }
