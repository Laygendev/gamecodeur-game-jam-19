var HashMap = require('hashmap');

var Player = require('./Player');
var Entity = require('./Entity');
var Bullet = require('./Bullet');
var World = require('./World');
var Constants = require('./Constants');

class Room {
  constructor(id, server) {
    this.id = id;
    this.server = server;

    this.players = new HashMap();
    this.messages = [];
    this.projectiles = [];
    this.numberAlive = 0;
    this.needToDeleted = false;

    this.isStarted = false;
    this.timerTryToStart = 0;
    this.onTryToStart = false;
    this.isWaitingForStart = false;
  }

  addNewPlayer(socket, data) {
    this.players.set(socket.id, Player.generateNewPlayer(data.name, socket.id, data.screen));

    return this.players.size;
  }

  spawn(id) {
    this.isWaitingForStart = true;

    var currentClient = this.server.clients.get(id);
    var currentPlayer = this.players.get(id);

    currentClient.socket.emit('room-spawn', {
      id: id,
      name: currentPlayer.name,
      position: currentPlayer.position,
      orientation: currentPlayer.orientation,
      screen: currentPlayer.screen,
      numberAlive: this.players.size,
      players: this.players.values().filter(function(player) {
        if (player.id == currentPlayer.id) {
          return false;
        }

        return true;
      })
    });

    var ids = this.players.keys();
    // envoies son spawn a tout e monde
    for (var i = 0; i < ids.length; i++) {
      var otherClient = this.server.clients.get(ids[i]);

      if ( id != ids[i] ) {
        otherClient.socket.emit('room-spawn', {
          numberAlive: this.players.size,
          id: id,
          name: currentPlayer.name,
          position: currentPlayer.position,
        })
      }
    }
  }

  tryToStart() {
    this.onTryToStart = true;
    this.timerTryToStart = (new Date()).getTime();
    console.log('ok');

    // Envoies au autres quand veut lancer la game
  }

  start() {
    this.isStarted = true;

    var ids = this.players.keys();
    for (var i = 0; i < ids.length; i++) {
      var currentClient = this.server.clients.get(ids[i]);
      var currentPlayer = this.players.get(ids[i]);

      currentPlayer.position = World.getRandomPoint();

      currentClient.socket.emit('room-start', {
        id: ids[i],
        position: currentPlayer.position
      });
    }
  }

  removePlayer(id) {
    var name = '';
    if (this.players.has(id)) {
      var player = this.players.get(id);
      name = player.name;

      this.players.remove(id);
      this.server.io.to(this.id).emit('room-remove-player', id);
<<<<<<< HEAD

=======
>>>>>>> f264d8943c31e24748e807a2e9c72adf38c9bafa
      this.numberAlive--;
      this.checkNumberAlive();
    }

    this.checkCloseRoom();

    return name;
  }

  checkCloseRoom() {
    if (this.players.size === 0) {
      this.needToDeleted = true;
    }
  }

  update(dtSec) {
    if (this.onTryToStart) {
      // Lance la partie au bout de 10 secondes
      if ((new Date()).getTime() > this.timerTryToStart + Constants.DEFAULT_TIME_TO_START_ROOM) {
        this.onTryToStart = false;
        this.start();
      }
    }

    for (var i = 0; i < this.projectiles.length; ++i) {
      var hitInfo = this.projectiles[i].update(this, this.players, dtSec);

      if (hitInfo) {
        if (hitInfo.killingPlayer) {
          var currentClient = this.server.clients.get(hitInfo.killingPlayer.id);
          currentClient.socket.emit('room-update-ui', {kills: hitInfo.killingPlayer.kills});
        }

        if (hitInfo.hitPlayer.death) {
          this.numberAlive--;
          this.server.io.to(this.id).emit('room-update-ui', {
            numberAlive: this.numberAlive,
            message: hitInfo.killingPlayer.name + ' kill ' + hitInfo.hitPlayer.name
          });
          var currentClient = this.server.clients.get(hitInfo.hitPlayer.id);
          currentClient.socket.emit('room-update-ui', {top: (this.numberAlive + 1)});

          this.checkNumberAlive();
        }
      }

      if (this.projectiles[i].needToDeleted) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  checkNumberAlive() {
    if (this.numberAlive <= 1) {
      var alivePlayer = null;
      var ids = this.players.keys();
      for (var i = 0; i < ids.length; i++) {
        var player = this.players.get(ids[i]);

        if (!player.death) {
          alivePlayer = player;
          break;
        }
      }

      if (alivePlayer) {
        var currentClient = this.server.clients.get(alivePlayer.id);
        currentClient.socket.emit('room-update-ui', {top: this.numberAlive });
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
