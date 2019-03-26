/**
 * @fileOverview Create express Server, add static folder: lib, shared, asset
 * and src.
 *
 * Send index.html file and call create tankServer.
 * When io connection is called, call handleSocket method from tankServer
 * Object.
 *
 * @author BwooGames
 * @version 0.1.0
 */

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http, { pingInterval: 2000 })
const path = require('path')

const TankServer = require('./Server')
const tankServer = new TankServer(io)

app.use('/lib', express.static('lib'))
app.use('/shared', express.static('shared'))
app.use('/asset', express.static('asset'))
app.use('/src', express.static('src'))

app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'))
})

io.on('connection', (socket) => { tankServer.handleSocket(socket) })

http.listen(80, function () {
  console.log('listening on *:80')
})
