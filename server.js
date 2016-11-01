
let finalhandler = require('finalhandler')
let http = require('http')
let serveStatic = require('serve-static')

let serve = serveStatic('public', {'index': ['index.html']})

let server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})

server.listen(80)
