class Room {
  constructor(game, socket) {
    this.game = game;
    this.socket = socket;
    this.messages = [];

    this.socket.on('room-started', (data) => { this.start(data); });
    this.socket.on('room-messages', (data) => { this.receiveMessage(data); });
    this.socket.on('room-update', (data) => { this.receiveUpdate(data); });
    this.socket.on('room-update-ui', (data) => { this.receiveUpdateUI(data); });
  }

  start(data) {
    this.game.addPlayer(data);

    for (var key in data.players) {
      this.game.addPlayer(data.players[key]);
    }

    this.game.htmlUI.updateLeftPlayer(data.numberAlive);

    this.game.start();
  }

  receiveMessage(data) {
    var receiveTimestamp = +new Date();

    this.messages.push({
      receiveTimestamp: receiveTimestamp + data[1],
      worldState: data.worldState
    });
  }

  receiveUpdate(data) {
    this.game.projectiles = data.projectiles;
  }

  receiveUpdateUI(data) {
    if (data.hits) {
      for (var i = 0; i < data.hits.length; ++i) {
        this.game.ui.displayDamage(data.hits[i]);
      }
    }

    if (data.numberAlive) {
      this.game.htmlUI.updateLeftPlayer(data.numberAlive);
    }

    if (data.message) {
      this.game.htmlUI.addMessage(data.message);
    }

    if (data.kills) {
      this.game.htmlUI.updateKill(data.kills);
    }
  }

  update() {
    this.processServerMessage();
    this.interpolateEntities();
  }

  getAvailableMessage() {
    let now = +new Date();
    for (var i = 0; i < this.messages.length; ++i) {
      let message = this.messages[i];

      if (message.receiveTimestamp <= now) {
        this.messages.splice(i, 1);

        return {
          worldState: message.worldState
        };
      }
    }
  }

  processServerMessage() {
    while (true) {
      var messages = this.getAvailableMessage();

      if (!messages) {
        break;
      }

      for (var i = 0; i < messages.worldState.length; ++i) {
        var state = messages.worldState[i];

        var entity = this.game.tanks[state.id];

        if (state.id == this.game.id) {
          entity.position = state.position;
          entity.orientation = state.orientation;
          entity.turretAngle = state.turretAngle;
          entity.health = state.health;
          entity.death = state.death;

          var j = 0;
          while (j < this.game.pendingInputs.length) {
            var input = this.game.pendingInputs[j];

            if (input[2] <= state.lastProcessedInput) {
              this.game.pendingInputs.splice(j, 1);
            } else {
              entity.updateOnInput(input);
              j++;
            }
          }
        } else {
          if (entity) {
            entity.health = state.health;
            entity.death = state.death;
            var timestamp = +new Date();
            entity.positionBuffer.push([
              timestamp,
              state.position[0],
              state.position[1],
              state.orientation,
              state.turretAngle]);
          }
        }
      }
    }
  }

  interpolateEntities() {
    var now = +new Date();
    var render_timestamp = now - (1000.0 / 10);
    for (var i in this.game.tanks) {
      var entity = this.game.tanks[i];

      if (entity.id == this.id) {
          continue;
      }

      var buffer = entity.positionBuffer;

      while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
        buffer.shift();
      }

      if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
        var t0           = buffer[0][0];
        var t1           = buffer[1][0];
        var x0           = buffer[0][1];
        var x1           = buffer[1][1];
        var y0           = buffer[0][2];
        var y1           = buffer[1][2];
        var orientation0 = buffer[0][3];
        var orientation1 = buffer[1][3];
        var turretAngle0 = buffer[0][4];
        var turretAngle1 = buffer[1][4];

        entity.position[0] = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
        entity.position[1] = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
        entity.orientation = orientation0 + (orientation1 - orientation0) * (render_timestamp - t0) / (t1 - t0);
        entity.turretAngle = turretAngle0 + (turretAngle1 - turretAngle0) * (render_timestamp - t0) / (t1 - t0);
        entity.waitMessage = false;
      }
    }
  }
}
