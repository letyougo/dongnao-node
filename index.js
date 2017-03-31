/**
 * Created by xiaoxiaosu on 17/3/31.
 */

var socketio = require('socket.io');
var express = require('express')
var path = require('path')
var fs = require('fs')
var watch = require('watch');
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);
var UglifyJS = require("uglify-js");
var uglifycss = require('uglifycss');


var srcRoot = path.join(__dirname,'src')
var cssRoot = path.join(srcRoot,'css')
var jsRoot = path.join(srcRoot,'js')
app.get('/',function (req,res) {
    res.send(getHtml())
})

function getHtml() {
    return fs.readFileSync(path.join(srcRoot,'index.html'),'utf-8') + fs.readFileSync('./socket.xml','utf-8')
}

app.use(express.static(path.join(srcRoot)))

server.listen(3000,function (req, res) {
    console.log('http server start')
})

io.sockets.on('connection',function (socket) {
    console.log('a client connect')
    socket.emit('client-connect','hello client')

    watch.watchTree('./src', function (f, curr, prev) {
        if (typeof f == "object" && prev === null && curr === null) {
            // Finished walking the tree
        } else if (prev === null) {
            // f is a new file
            socket.emit('flie-create')
        } else if (curr.nlink === 0) {
            // f was removed

            socket.emit('flie-remove')
        } else {
            // f was changed


            var cssFile = fs.readdirSync(cssRoot).map(function (p) {
                return path.join(cssRoot,p)
            })

            var uglified = uglifycss.processFiles(
                cssFile,
                { maxLineLen: 500, expandVars: true }
            );
            console.log(uglified)
            socket.emit('file-change')
        }
    })
})
