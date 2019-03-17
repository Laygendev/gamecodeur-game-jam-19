var HashMap = require('hashmap');

var Entity = require('./Entity');
var Room = require('./Room');

var Util = require('./Util');

var width = 8000;
var height = 8000;

class Server {
  constructor(io) {
    this.io = io;

    this.clients = new HashMap();
    this.rooms = new HashMap();

    this.last_ts = 0;

    setInterval(() => { this.update(); }, 1000 / 60);
  }

  handleSocket(socket) {
    socket.on('join-room', (data) => { this.addNewPlayer(socket, data); });
    socket.on('player-action', (data) => { this.updatePlayer(socket, data); });

    socket.emit('connected');
  }

  /**
   * Add new player
   */
  addNewPlayer(socket, data) {
    // Search not started room.
    var foundedRoom = null;

    var ids = this.rooms.keys();
    for (var i = 0; i < ids.length; ++i) {
      if (!this.rooms[i].isStarted) {
        foundedRoom = this.rooms.get(ids[i]);
        break;
      }
    }

    if (!foundedRoom) {
      var roomID = (new Date()).getTime();
      this.rooms.set(roomID, new Room(roomID, this));

      foundedRoom = this.rooms.get(roomID);
    }

    this.clients.set(socket.id, {
      socket: socket,
      latency: 0,
      room: foundedRoom
    });

    // Now, we can add new player in the founded room.
    foundedRoom.addNewPlayer(socket, data);
    foundedRoom.start();
  }

  updatePlayer(socket, data) {
    var client = this.clients.get(socket.id);

    if (client) {
      client.latency = (new Date()).getTime() - data.timestamp;
    }

    var room = this.rooms.get(client.room.id);

    if (room) {
      room.updatePlayer(socket.id, data.keyboardState, data.turretAngle);
    }
  }

  disconnect(socket) {
  }

  update() {
    var ids = this.rooms.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentRoom = this.rooms.get(ids[i]);
      if (currentRoom.isStarted) {
        currentRoom.update();
        currentRoom.sendState();
      }
    }
  }
}


module.exports = Server;
