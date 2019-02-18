const Koa = require('koa')
const bodyParser = require('koa-bodyparser')

const { initializeDB } = require('./db/connection')

const db = initializeDB()

module.exports = { db }

const router = require('./routes')

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())

app.listen(80)
