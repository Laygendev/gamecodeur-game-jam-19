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

    this.lastTimestamp = 0;

    setInterval(() => { this.update(); }, 1000 / 60);
    setInterval(() => { this.updatePlayers(); }, 1000 / 10);
  }

  handleSocket(socket) {
    socket.on('join-room', (data) => { this.addNewPlayer(socket, data); });
    socket.on('player-action', (data) => { this.receiveMessages(socket, data); });

    socket.emit('connected', socket.id);
  }

  /**
   * Add new player
   */
  addNewPlayer(socket, data) {
    // Search not started room.
    var foundedRoom = null;

    var ids = this.rooms.keys();
    for (var key in ids) {
      var currentRoom = this.rooms.get(ids[key]);
      if (currentRoom && !currentRoom.isStarted) {
        foundedRoom = currentRoom;
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
      room: foundedRoom
    });

    // Now, we can add new player in the founded room.
    var numberPlayer = foundedRoom.addNewPlayer(socket, data);

    socket.join(foundedRoom.id);

    if (numberPlayer == 2) {
      foundedRoom.start();
    }
  }

  receiveMessages(socket, data) {
    var client = this.clients.get(socket.id);

    if (client) {
      var room = this.rooms.get(client.room.id);

      if (room) {
        room.receiveMessages(socket, client, data);
      }
    }
  }

  disconnect(socket) {
  }

  update() {
    var nowTimestamp = +new Date();
    var lastTimestamp = this.lastTimestamp || nowTimestamp;
    var dtSec = (nowTimestamp - lastTimestamp) / 1000.0;
    this.lastTimestamp = nowTimestamp;


    var ids = this.rooms.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentRoom = this.rooms.get(ids[i]);
      if (currentRoom.isStarted) {
        currentRoom.processInput();
        currentRoom.update(dtSec);
        currentRoom.sendState();
      }
    }
  }

  updatePlayers() {
    var ids = this.rooms.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentRoom = this.rooms.get(ids[i]);
      if (currentRoom.isStarted) {
        currentRoom.sendWorldState();
      }
    }
  }
}


module.exports = Server;
