//======================================================
// File: server.js
// Descr: Nodejs server for Wizard Warz.
//
// Author: Magnus Persson
// Date: 2014-01-31
//======================================================

//======================================================
// Configuration
//======================================================
var version = "0.1";
var port = 8080;

//======================================================
// Initialization
//======================================================
var server = require("https");
var fs = require("fs");

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/cert.pem')
};

server = server.createServer(options);

var io = require("socket.io").listen(server).set('log level',1);

io = io.sockets.on("connection", SocketHandler);


var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);
console.log("===================================");
console.log("Server for Tank.io");
logger.log("Started server on port "+port);

var sockets = new Array();
var players = [];
var bullets = [];
var rooms = [];
var unique_count = 1;

var width = 3000;
var height = 3000;

var Entity = require('./entity.js');
var Room = require('./room.js');
var Utils = require('./utils.js');


function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    socket.on('disconnect', Disconnect);
    socket.on('JoinRoom', JoinRoom);
    socket.on('0', ReceiveMessages);
    socket.on('Start', Start);
    socket.on('pingto', function() {
      socket.emit('pongto');
    })

    socket.emit("connected", socket.id);
    sockets.push(socket);
}

function Start(roomID) {
  var room = rooms[this.player.roomID];
  room.start();
}

function Disconnect() {
    var i = sockets.indexOf(this);
    if(this.player != undefined) {
        logger.log("disconnected user: "+this.player.name);

        var room = rooms[this.player.roomID];

        if (room.isStarted) {
          this.broadcast.to(this.player.roomID).emit("RemovePlayer", {
            id: this.player.id
          });

          this.broadcast.to(this.player.roomID).emit("Message", this.player.pseudo + ' s\'est déconnecté(e)' );
        }

        room.delete(this.player.id);
    }
    sockets.splice(i, 1);
}

function JoinRoom(data) {
    var player = new Entity(0,0,0);
    player.id = data.id;
    player.pseudo = data.pseudo;
    player.kill = 0;

    this.player = player;
    player.socket = this;

    var currentRoom = undefined;

    for (var key in rooms) {
        if (! rooms[key].isStarted && rooms[key].numberPlayer < rooms[key].maxPlayer) {
            rooms[key].add(player);

            player.roomID = rooms[key].id;
            currentRoom = rooms[key];
            break;
        }
    }

    if (! currentRoom) {
        currentRoom = new Room(io, width, height);
        currentRoom.add(player);
        player.roomID = currentRoom.id;

        rooms[currentRoom.id] = currentRoom;
    }


    this.join(currentRoom.id);

    io.to(currentRoom.id).emit('JoinedRoom', {
        id: currentRoom.id,
        numberPlayer: currentRoom.numberPlayer,
        maxPlayer: currentRoom.maxPlayer
    });

    if(currentRoom.numberPlayer == currentRoom.maxPlayer) {
        currentRoom.start();
    }
}

function Length(obj) {
    return Object.keys(obj).length;
}

function Shoot(data) {
  var room = rooms[data.roomID];
  if (room) {
    var player = room.players[data.id];

    if (player) {

        var bullet = {
            'roomID': data.roomID,
            'id': data.id,
            'bulletid': new Date().getTime(),
            'basePos': JSON.parse(JSON.stringify(player.posCanonServer)),
            'speed': 500,
            'distanceMax': 600,
            'endcanonangle': Utils.radiansToDegrees(player.canonAngle),
            'angleRadians': player.canonAngle,
            'pos': JSON.parse(JSON.stringify(player.posCanonServer))
        };

        io.to(data.roomID).emit("Shoot", bullet);

        room.addBullet(bullet);
    }
  }
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

// Update player position
function ReceiveMessages(data) {
  var now = +new Date();
  var room = rooms[data.room_id];
  if (room) {
    var player = room.players[data.id];
    if (player) {
      this.player.socket.lag = data.lag;

      messages.push({
        recv_ts: now + data.lag,
        payload: data,
      });
    }
  }
}

var dt;
var lastframetime;
var updateid;
var startTime;
var last_processed_input = [];
var messages = [];
var t = 0;
var pt = 0;
var last_ts;

function update() {
    var now_ts = +new Date();
    var lasts_ts = last_ts || now_ts;
    var dt_sec = (now_ts - lasts_ts) / 1000.0;
    last_ts = now_ts;

    processInput();

    for (var key in rooms) {
      rooms[key].update(dt_sec);
      rooms[key].sendWorldState();
    }
}

function getAvailableMessage() {
  var now = +new Date();
	for (var i = 0; i < messages.length; i++) {
		var message = messages[i];
		if (message.recv_ts <= now) {
			messages.splice(i, 1);
			return message.payload;
		}
	}
}


function processInput() {
  while (true) {
   var message = getAvailableMessage();
   if (!message) {
     break;
   }

   var id      = message.id;
   var room_id = message.room_id;

   var room = rooms[room_id];
   var entity = room.players[id];

   if (entity) {
     if (message.shoot) {
       Shoot({
         'roomID': message.room_id,
         'id': message.id,
         'basePos': JSON.parse(JSON.stringify(entity.posCanonServer)),
         'endcanonangle': Utils.radiansToDegrees(entity.canonAngle),
         'angleRadians': entity.canonAngle,
         'pos': JSON.parse(JSON.stringify(entity.posCanonServer))
       });
     }

     entity.applyInput(message);
     entity.last_processed_input = message.input_sequence_number;
   }

 }
}

setInterval(() => { update(); }, 1000 / 60);

function collision(tab, P) {
    for (var i = 0; i < 4; i++) {
        var A = tab[i].pos;
        var B;
  		if (i == 3) {
  			B = tab[0].pos
  		} else {
            B = tab[i + 1].pos;
        }
  		var D = {X: 0, Y: 0};
  		var T = {X: 0, Y: 0};

  		D.X = B.x - A.x;
  		D.Y = B.y - A.y;
  		T.X = P.x - A.x;
  		T.Y = P.y - A.y;
  		var d = D.X*T.Y - D.Y*T.X;
  		if (d > 0) {
  			return false;
  		}
    }

    return true;
}
