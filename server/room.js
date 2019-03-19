var HashMap = require('hashmap');

var Player = require('./Player');
var Entity = require('./Entity');
var Bullet = require('./Bullet');

class Room {
  constructor(id, server) {
    this.id = id;
    this.server = server;

    this.players = new HashMap();
    this.messages = [];
    this.projectiles = [];
    this.numberAlive = 0;
  }

  addNewPlayer(socket, data) {
    this.players.set(socket.id, Player.generateNewPlayer(data.name, socket.id, data.screen));

    return this.players.size;
  }

  start() {
    this.isStarted = true;

    var ids = this.players.keys();
    this.numberAlive = ids.length;
    for (var i = 0; i < ids.length; ++i) {
      var currentClient = this.server.clients.get(ids[i]);
      var currentPlayer = this.players.get(ids[i]);

      currentClient.socket.emit('room-started', {
        id: ids[i],
        name: currentPlayer.name,
        position: currentPlayer.position,
        orientation: currentPlayer.orientation,
        screen: currentPlayer.screen,
        numberAlive: this.numberAlive,
        players: this.players.values().filter(function(player) {
          if (player.id == currentPlayer.id) {
            return false;
          }

          return true;
        })
      });
    }
  }

  update(dtSec) {
    for (var i = 0; i < this.projectiles.length; ++i) {
      var hitInfo = this.projectiles[i].update(this.players, dtSec);

      if (hitInfo) {
        if (hitInfo.hitPlayer.death) {
          this.numberAlive--;
          this.server.io.to(this.id).emit('room-update-ui', {numberAlive: this.numberAlive});
        }

        if (hitInfo.killingPlayer) {

        }
      }

      if (this.projectiles[i].needToDeleted) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  receiveMessages(socket, client, data) {
    var now = +new Date();

    var player = this.players.get(socket.id);

    if (player) {
      client.lag = data[1];

      this.messages.push({
        receiveTimestamp: now + data[1],
        payload: data,
      });
    }
  }

  getAvailableMessage() {
    var now = +new Date();
    for (var i = 0; i < this.messages.length; i++) {
      var message = this.messages[i];
      if (message.receiveTimestamp <= now) {
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

      var id = message[0];
      var player = this.players.get(id);

      if (player) {
        player.updateOnInput(message);

        if (message[4] && player.canShoot()) {
          this.projectiles.push(new Bullet(JSON.parse(JSON.stringify(player.position)), player.turretAngle, player.id))

          player.lastShotTime = (new Date()).getTime();
        }

        player.lastProcessedInput = message[2];
      }
    }
  }

  sendState() {
      var ids = this.players.keys();
      for (var i = 0; i < ids.length; ++i) {
        var currentClient = this.server.clients.get(ids[i]);
        var currentPlayer = this.players.get(ids[i]);

        currentClient.socket.emit('room-update', {
          projectiles: this.projectiles.filter(function(projectile) {
            return projectile.isVisibleTo(currentPlayer);
          })
        });
      }
  }

  sendWorldState() {
    var ids = this.players.keys();
    for (var i = 0; i < ids.length; ++i) {
      var currentClient = this.server.clients.get(ids[i]);
      var currentPlayer = this.players.get(ids[i]);

      currentClient.socket.emit('room-messages', {
        1: currentClient.lag,
        worldState: this.players.values().filter(function(player) {
          if (player.isVisibleTo(currentPlayer)) {
            player.isVisible = true;
            return true;
          } else {
            if (player.isVisible) {
              player.isVisible = false;
              return true;
            }
          }

          if (!player.isVisible) {
            return false;
          }
        })
      })
    }
  }
}

module.exports = Room;
