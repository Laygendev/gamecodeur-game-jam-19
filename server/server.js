var Entity = require('./entity.js');
var Room = require('./room.js');
var Utils = require('./utils.js');

var width = 5000;
var height = 5000;

class Server {
  constructor(io) {
    this.io = io;

    this.sockets  = new Array();
    this.players  = [];
    this.bullets  = [];
    this.rooms    = [];
    this.last_ts  = 0;

    setInterval(() => { this.update(); }, 1000 / 60);
  }

  handleSocket(socket) {
    socket.on('disconnect', () => { this.disconnect(socket); });
    socket.on('JoinRoom', (data) => { this.joinRoom(data); });
    socket.on('leaveRoom', (data) => { this.leaveRoom(data); });
    socket.on('0', (data) => { this.receiveMessages(data); });
    socket.on('Start', (data) => { this.start(data); });
    socket.on('startVote', (data) => { this.startVote(data); });
    socket.on('vote', (data) => { this.vote(data); });
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

        if (room) {
          if (room.isStarted) {
            this.io.to(socket.player.roomID).emit("RemovePlayer", {
              id: socket.player.id
            });

            this.io.to(socket.player.roomID).emit("Message", socket.player.pseudo + ' s\'est déconnecté(e)' );
          }

          room.numberPlayerAlive--;
          room.delete(socket.player.id);
        }
    }

    this.sockets.splice(i, 1);
  }

  update() {
    var now_ts = +new Date();
    var last_ts = this.last_ts || now_ts;
    var dt_sec = (now_ts - last_ts) / 1000.0;
    this.last_ts = now_ts;

    for (var key in this.rooms) {
      this.rooms[key].processInput();
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

      if (currentSocket) {
        currentSocket.player = player;
        var currentRoom      = undefined;

        for (var key in this.rooms) {
            if (! this.rooms[key].isStarted && this.rooms[key].numberPlayer < this.rooms[key].maxPlayer) {
                this.rooms[key].add(player);

                player.roomID = this.rooms[key].id;
                player.room   = this.rooms[key];
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
  }

  leaveRoom(data) {
    var room = this.rooms[data.roomID];

    if (room) {
      var player = room.players[data.id];

      if (player) {
        delete room.players[data.id];
        room.numberPlayer--;

        if (room.isFinish) {
          delete this.rooms[room.id];
        }
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

        room.messages.push({
          recv_ts: now + data.lag,
          payload: data,
        });
      }
    }
  }

  startVote(data) {
    var room = this.rooms[data.roomID];

    if (room && !room.isStarted) {
      room.addVote({
        id: data.id,
        ok: true
      });

      var votes = [];

      for (var key in room.votes) {
        votes.push(room.votes[key]);
      }

      this.io.to(room.id).emit('roomVote', votes);
    }
  }

  vote(data) {
    var room = this.rooms[data.roomID];

    if (room && !room.isStarted) {
      room.addVote({
        id: data.id,
        ok: data.od
      });

      for (var key in room.votes) {
        votes.push(room.votes[key]);
      }

      this.io.to(room.id).emit('roomVote', votes);
    }
  }
}


module.exports = Server;
