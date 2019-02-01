const Koa = require('koa')
const app = new Koa()
const db = require('./db/connection')
console.log(db)

app.listen(80)
