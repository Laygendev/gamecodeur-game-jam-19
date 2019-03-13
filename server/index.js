var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingInterval: 1000,
  upgradeTimeout: 5000
});
var TankServer = require('./server.js');
var tankServer = new TankServer(io);
var path = require('path');

app.use('/lib', express.static('lib'));
app.use('/shared', express.static('shared'));
app.use('/asset', express.static('asset'));
app.use('/src', express.static('src'));

app.get('/', function(req, res){
  res.sendFile(path.resolve('index.html'));
});

io.on('connection', (socket) => { tankServer.handleSocket(socket); });

http.listen(8080, function(){
  console.log('listening on *:8080');
});
