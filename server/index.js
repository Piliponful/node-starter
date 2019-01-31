const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const path = require('path')

app.use(serve(path.resolve(__dirname, 'dist/ArialPoint')))

app.listen(80)
