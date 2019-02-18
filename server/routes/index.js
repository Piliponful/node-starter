const Router = require('koa-router')
const router = new Router()

const user = require('./user')
const tenant = require('./tenant')
const dxfFile = require('./dxfFile')

router.use(user.routes())
router.use(tenant.routes())
router.use(dxfFile.routes())

module.exports = router
