const Router = require('koa-router')
const router = new Router()

const users = require('./user')

router.use(users.routes())

module.exports = router
