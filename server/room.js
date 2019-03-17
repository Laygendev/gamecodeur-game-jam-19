var HashMap = require('hashmap');
var Player = require('./Player');

class Room {
  constructor(id, server) {
    this.id = id;
    this.server = server;

    this.players = new HashMap();
  }

  addNewPlayer(socket, data) {
    this.players.set(socket.id, Player.generateNewPlayer(data.name, socket.id));
  }

  start() {
    this.isStarted = true;

    var ids = this.players.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentClient = this.server.clients.get(ids[i]);

      currentClient.socket.emit('room-started');
    }
  }

  updatePlayer(id, keyboardState, turretAngle) {
    var player = this.players.get(id);

    if (player) {
      player.updateOnInput(keyboardState, turretAngle);
    }
  }

  getPlayers() {
    return this.players.values();
  }

  update() {
    var players = this.getPlayers();

    for (var i = 0; i < players.length; ++i) {
      players[i].update();
    }
  }

  sendState() {
    var ids = this.players.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentPlayer = this.players.get(ids[i]);
      var currentClient = this.server.clients.get(ids[i]);

      currentClient.socket.emit('update', {
        self: currentPlayer,
        players: this.players.values().filter(function(player) {
          if (player.id == currentPlayer.id) {
            return false;
          }

          return player.isVisibleTo(currentPlayer);
        })
      });
    }
  }
}

module.exports = Room;
