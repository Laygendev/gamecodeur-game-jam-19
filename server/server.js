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

global.window = global.document = global;

var frame_time = 60/1000; // run the local game at 16ms/ 60hz

if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz
console.log(frame_time);
( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );


function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    socket.on('disconnect', Disconnect);
    socket.on('JoinRoom', JoinRoom);
    socket.on('0', ReceiveMessages);
    // socket.on('Shoot', Shoot);
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
        currentRoom = new Room();
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
            'endcanonangle': radians_to_degrees(player.canonAngle),
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

  // var room = rooms[data.roomID];
  // if (room) {
  //     var player = room.players[data.id];
  //     if (player) {
  //       player.info = data;
  //       this.broadcast.to(data.roomID).emit("UpdatePlayerPosition", data);
  //     }
  //   }
}

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
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

   // Update the state of the entity, based on its input.
   // We just ignore inputs that don't look valid; this is what prevents clients from cheating.
   var id      = message.id;
   var room_id = message.room_id;

   var room = rooms[room_id];
   var entity = room.players[id];

   if (message.shoot) {
     Shoot({
       'roomID': message.room_id,
       'id': message.id,
       'basePos': JSON.parse(JSON.stringify(entity.posCanonServer)),
       'endcanonangle': radians_to_degrees(entity.canonAngle),
       'angleRadians': entity.canonAngle,
       'pos': JSON.parse(JSON.stringify(entity.posCanonServer))
     });
   }

   entity.applyInput(message);
   last_processed_input[id] = message.input_sequence_number;

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


class Room {
    constructor() {
        this.id           = new Date().getTime();
        this.numberPlayer = 0;
        this.maxPlayer    = 10;
        this.players      = [];
        this.bullets      = [];
        this.isStarted    = false;
    }

    add(player) {
        this.players[player.id] = player;
        this.numberPlayer++;
    }

    delete(playerID) {
      delete this.players[playerID];
      this.numberPlayer--;
    }

    addBullet(bullet) {
      this.bullets.push(bullet);
    }

    start() {
      this.isStarted = true;
        for (var key in this.players) {
            this.players[key].life = 5;
            this.players[key].isAlive = true;

            this.players[key].pos = {
                x: Math.floor(Math.random() * (width - 100)) + 100,
                y: Math.floor(Math.random() * (height - 100)) + 100,
            };

            this.players[key].pos.x = 0;
            this.players[key].pos.y = 0;


            let dataPlayer = {
              id: this.players[key].id,
              pseudo: this.players[key].pseudo,
              life: this.players[key].life,
              alive: this.players[key].isAlive,
              pos: this.players[key].pos
            };

            this.players[key].socket.emit("spawnPlayer", {
              player: dataPlayer,
              map: {
                width: width,
                height: height,
              }
            });

            this.players[key].socket.broadcast.to(this.players[key].roomID).emit("addPlayer", { player: dataPlayer });

            // for (var k in this.players) {
            //   if (this.players[key].id != this.players[k].id) {
            //     let dataPlayer = {
            //       id: this.players[k].id,
            //       pseudo: this.players[k].pseudo,
            //       life: this.players[k].life,
            //       alive: this.players[k].isAlive,
            //       pos: this.players[k].pos
            //     };
            //
            //     this.players[key].socket.to(this.players[k].roomID).emit("addPlayer", { player: dataPlayer } );
            //   }
            // }
        }

        io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);

    }

    update(dt) {
      for (var key in this.bullets) {
          this.bullets[key].pos.x += this.bullets[key].speed * Math.cos(this.bullets[key].angleRadians) * dt;
          this.bullets[key].pos.y += this.bullets[key].speed * Math.sin(this.bullets[key].angleRadians) * dt;

          var destroyBullet = false;

          var playerHit = undefined

          for(var key_player in this.players) {
              if ( this.players[key_player].id != this.bullets[key].id && this.players[key_player].isAlive && this.players[key_player].info && this.players[key_player].info.colliderPointServer ) {
                  if (collision(this.players[key_player].info.colliderPointServer, this.bullets[key].pos)) {
                    this.players[key_player].life--;

                    if (this.players[key_player].life <= 0) {
                      this.players[this.bullets[key].id].kill++;
                      this.players[key_player].isAlive = false;
                      this.numberPlayer--;
                      io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);
                      io.to(this.bullets[key].id).emit("UpdateKill", this.players[this.bullets[key].id].kill);
                      io.to(this.bullets[key].roomID).emit("Message", this.players[this.bullets[key].id].pseudo + ' à pulvérisé ' + this.players[key_player].pseudo );
                      this.checkWinner();
                    }
                      var hit = {
                          bulletID: this.bullets[key].bulletid,
                          playerID: this.players[key_player].id,
                          player: {
                            life: this.players[key_player].life,
                            isAlive: this.players[key_player].isAlive,
                            top: this.numberPlayer + 1
                          }
                      };

                      io.to(this.bullets[key].roomID).emit("HitPlayer", hit);
                      this.bullets.splice(key, 1);
                      destroyBullet = true;
                      break;
                  }
              }
          }

          if ( destroyBullet ) {
              continue;
          }

          var dist = Math.sqrt( Math.pow((this.bullets[key].basePos.x-this.bullets[key].pos.x), 2) + Math.pow((this.bullets[key].basePos.y-this.bullets[key].pos.y), 2) );
          if (dist >= this.bullets[key].distanceMax) {
              io.to(this.bullets[key].roomID).emit("MissileDelete", this.bullets[key]);
              this.bullets.splice(key, 1);
          }
      }
    }


    sendWorldState() {
      var data = {
    		send_ts: +new Date(),
    		world_state: []
    	};

    	for (var key in this.players) {
    		if ( this.players[key] ) {
    			data.world_state.push({
    				id: this.players[key].id,
    				x: this.players[key].pos.x,
            y: this.players[key].pos.y,
            canonAngle: this.players[key].canonAngle,
            angleMove: this.players[key].angleMove,
            angle: this.players[key].angle,
            colliderPoint: this.players[key].colliderPoint,
            colliderPointServer: this.players[key].colliderPointServer,
    				last_processed_input: last_processed_input[this.players[key].id]
    			});
    		}
    	}

    	for (var key in this.players) {
        if ( this.players[key].socket ) {
          data.lag = this.players[key].socket.lag;
          this.players[key].socket.emit('1', data);
        }
      }

    }

    checkWinner() {
      if (this.numberPlayer == 1) {
        var winner = undefined;
        for(var key_player in this.players) {
          if (this.players[key_player].isAlive) {
            winner = this.players[key_player];
            break;
          }
        }

        io.to(this.id).emit("Winner", {
          id: winner.id,
          pseudo: winner.pseudo,
          top: 1
        });
      }
    }

    remove(player) {

    }
}

class Entity  {
  constructor(id) {
    this.id = id;
    this.speed = 200;
    this.speedRotation = 150;
    this.pos = {
      x: 0,
      y: 0
    };
    this.angle = 0;
    this.angleMove = 0;
    this.canonAngle = 0;
    this.position_buffer = [];
    this.colliderPoint = [];
    this.colliderPointServer = [];
    this.posCanonServer;
  }

  applyInput(input) {
    this.posCanonServer = input.posCanonServer;
    this.colliderPoint = input.colliderPoint;
    this.colliderPointServer = input.colliderPointServer;
    this.canonAngle = input.canonAngle;
    this.angleMove = degrees_to_radians(this.angle);

    this.angle -= input.left_press_time * this.speedRotation;
    this.angle += input.right_press_time * this.speedRotation;

    this.pos.x += input.up_press_time * this.speed * Math.cos(this.angleMove);
    this.pos.y += input.up_press_time * this.speed * Math.sin(this.angleMove);
  }
}
