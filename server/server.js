var Entity = require('./entity.js');
var Room = require('./room.js');
var Utils = require('./utils.js');

var width = 3000;
var height = 3000;

class Server {
  constructor(io) {
    this.io = io;

    this.sockets  = new Array();
    this.players  = [];
    this.bullets  = [];
    this.rooms    = [];
    this.messages = [];
    this.last_ts  = 0;

    setInterval(() => { this.update(); }, 1000 / 60);
  }

  handleSocket(socket) {
    socket.on('disconnect', () => { this.disconnect(socket); });
    socket.on('JoinRoom', (data) => { this.joinRoom(data); });
    socket.on('0', (data) => { this.receiveMessages(data); });
    socket.on('Start', (data) => { this.start(data); });
    socket.on('pingto', function() {
      socket.emit('pongto');
    })

    socket.emit("connected", socket.id);

    this.sockets[socket.id] = socket;
  }

  disconnect(socket) {
    var i = this.sockets.indexOf(socket);

    if(socket.player != undefined) {
        var room = this.rooms[socket.player.roomID];

        if (room.isStarted) {
          this.io.to(socket.player.roomID).emit("RemovePlayer", {
            id: socket.player.id
          });

          this.io.to(socket.player.roomID).emit("Message", socket.player.pseudo + ' s\'est déconnecté(e)' );
        }

        room.delete(socket.player.id);
    }

    this.sockets.splice(i, 1);
  }

  update() {
    var now_ts = +new Date();
    var last_ts = this.last_ts || now_ts;
    var dt_sec = (now_ts - last_ts) / 1000.0;
    this.last_ts = now_ts;

    this.processInput();

    for (var key in this.rooms) {
      this.rooms[key].update(dt_sec);
      this.rooms[key].sendWorldState();
    }
  }

  start(roomID) {
    var room = this.rooms[roomID];
    room.start();
  }

  joinRoom(data) {
    var currentSocket = this.sockets[data.id];

      var player           = new Entity();
      player.id            = data.id;
      player.pseudo        = data.pseudo;
      player.socket        = currentSocket;
      currentSocket.player = player;
      var currentRoom      = undefined;

      for (var key in this.rooms) {
          if (! this.rooms[key].isStarted && this.rooms[key].numberPlayer < this.rooms[key].maxPlayer) {
              this.rooms[key].add(player);

              player.roomID = this.rooms[key].id;
              currentRoom   = this.rooms[key];
              break;
          }
      }

      if (! currentRoom) {
          currentRoom = new Room(this.io, width, height);
          currentRoom.add(player);
          player.roomID = currentRoom.id;
          player.room   = currentRoom;

          this.rooms[currentRoom.id] = currentRoom;
      }


      currentSocket.join(currentRoom.id);

      this.io.to(currentRoom.id).emit('JoinedRoom', {
          id: currentRoom.id,
          width: currentRoom.width,
          height: currentRoom.height,
          numberPlayer: currentRoom.numberPlayer,
          maxPlayer: currentRoom.maxPlayer
      });

      if(currentRoom.numberPlayer == currentRoom.maxPlayer) {
          currentRoom.start();
      }
  }

  shoot(data) {
    var room = this.rooms[data.roomID];
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

          this.io.to(data.roomID).emit("Shoot", bullet);

          room.addBullet(bullet);
      }
    }
  }

  receiveMessages(data) {
    var now = +new Date();
    var room = this.rooms[data.room_id];
    if (room) {
      var player = room.players[data.id];
      if (player) {
        player.socket.lag = data.lag;

        this.messages.push({
          recv_ts: now + data.lag,
          payload: data,
        });
      }
    }
  }

  getAvailableMessage() {
    var now = +new Date();
  	for (var i = 0; i < this.messages.length; i++) {
  		var message = this.messages[i];
  		if (message.recv_ts <= now) {
  			this.messages.splice(i, 1);
  			return message.payload;
  		}
  	}
  }


  processInput() {
    while (true) {
      var message = this.getAvailableMessage();
      if (!message) {
        break;
      }

      var id      = message.id;
      var room_id = message.room_id;

      var room   = this.rooms[room_id];
      var entity = room.players[id];

      if (entity) {
        if (message.shoot) {
          this.shoot({
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
}


module.exports = Server;
