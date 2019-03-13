var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var TankServer = require('./server.js');
var tankServer = new TankServer(io);

app.use(express.static('../asset'));
app.use(express.static('../src'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/../index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});
