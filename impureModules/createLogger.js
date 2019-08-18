const path = require('path')
const bunyan = require('bunyan')

const createLogger = () => {
  const logger = bunyan.createLogger({ name: 'arialpoint-server', streams: [{ path: path.resolve(__dirname, 'logs/log') }] })

  return logger
}

module.exports = { createLogger }
