const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const db = require('./db/connection')
const router = require('./routes')

const app = new Koa()

app.use(bodyParser())
app.use(router.routes())

app.listen(80)
