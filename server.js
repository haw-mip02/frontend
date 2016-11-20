
let finalhandler = require('finalhandler')
let http = require('http')
let serveStatic = require('serve-static')

let serve = serveStatic('public', {'index': ['index.html']})

let server = http.createServer((req, res) => {
    if (req.url.indexOf('/analysis/') === 0) {
        let reqP = http.request({
            port: 5000,
            path: req.url,
            timeout: 5000
        }, resQ => {
            delete resQ.headers['content-length']
            res.writeHead(resQ.statusCode, resQ.statusMessage, resQ.headers)
            resQ.pipe(res)
        })
        reqP.on('error', e => {
            console.log(e)
            res.statusCode = 500
            res.end()
        })
        reqP.end()
    } else {
        serve(req, res, finalhandler(req, res))
    }
})

server.listen(80)
