const Router = require('koa-router')
const router = new Router()

const users = require('./user')
const tenant = require('./tenant')

router.use(users.routes())
router.use(tenant.routes())

module.exports = router
