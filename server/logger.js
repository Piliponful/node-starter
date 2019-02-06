const path = require('path')
const bunyan = require('bunyan')
const log = bunyan.createLogger({ name: 'arialpoint-server', streams: [{ path: path.resolve(__dirname, 'log') }] })

module.exports = log
