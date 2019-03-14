class Net {
  constructor(game) {
    this.game                  = game;
    this.id                    = undefined;
    this.init                  = false;
    this.isLookingForRoom      = false;
    this.pseudo                = '';
    this.room                  = undefined;
    this.startTime             = undefined;
    this.latency               = 0;
    this.messages              = [];
    this.pending_inputs        = [];
    this.input_sequence_number = 0;

    this.socket = io.connect("http://93.90.195.225:8080", {
      forceNew: true
    });


    this.socket.on('pong', (ms) => {
      this.latency = ms;
    });

    this.socket.on('connect_error', () => {
      // // @todo: Move to UI Class.
      //   if (this.room != undefined) {
      //       document.querySelector(".vote").style.display = "none";
      //       document.querySelector(".menu").style.display = "block";
      //       document.querySelector(".network-ready .state").innerHTML = "Press enter to looking for a game";
      //       game.stop();
      //   }
      //
      //   document.querySelector(".network-ready").style.display = 'none';
      //   document.querySelector(".network-not-ready").style.display = 'block';
      //
      //   document.querySelector(".network-not-ready").innerHTML = "Server offline";
    });

    this.socket.on('reconnecting', (n) => {
        document.querySelector(".network-not-ready").innerHTML = "Try reconnecting #" + n;
    });

    this.socket.on('connected', (id) => {
        document.querySelector(".network-ready").style.display = 'block';
        document.querySelector(".network-not-ready").style.display = 'none';

        this.id = id;
    });

    this.socket.on('UpdateNumberPlayer', (numberPlayer) => {
      game.htmlUI.updateLeftPlayer(numberPlayer);
    });

    this.socket.on('UpdateKill', (numberKill) => {
      game.htmlUI.updateKill(numberKill);
    });

    this.socket.on('JoinedRoom', (room) => {
        this.room = room;

        // @todo: Move to UI Class.
        document.querySelector(".vote").style.display = "block";
        document.querySelector(".network-ready .state").innerHTML = "Room #" + room.id + "<br />Waiting for other players (" + room.numberPlayer + "/" + room.maxPlayer + ")";
    });

    this.socket.on('UpdateWaitingRoomMessage', (data) => {
      document.querySelector(".network-ready .state").innerHTML = "Room #" + data.id + "<br />Waiting for other players (" + data.numberPlayer + "/" + data.maxPlayer + ")";
    })

    this.socket.on('Message', (message) => {
      game.htmlUI.addMessage(message);
    })

    this.socket.on('spawnPlayer', (data) => {
        game.width  = data.map.width;
        game.height = data.map.height;

        game.start();

        let tank = new Player(data.player.id, this.room, game, data.player.pos);
        tank.pseudo = data.player.pseudo;
        game.tanks[data.player.id] = tank;

        game.camera.setTarget(game.tanks[data.player.id], game.canvas.width / 2, game.canvas.height / 2);

        this.init = true;
        this.id = data.player.id;
        this.roomID = this.room.id;

        // @todo: Move to UI Class.
        document.querySelector(".menu").style.display = "none";
        document.querySelector(".in-game").style.display = "block";

        game.htmlUI.resetVote();

    });

    this.socket.on('addPlayer', (data) => {
      let tank = new Ennemy(data.player.id, this.room, game, data.player.pos);
      tank.pseudo = data.player.pseudo;
      game.tanks[data.player.id] = tank;
    });

    this.socket.on('1', (data) => {
      var recv_ts = +new Date();
        this.messages.push({
            recv_ts: recv_ts + data[1],
            world_state: data.world_state,
            bullets: data.bullets
        });
    });

    this.socket.on('Shoot', (data) => {
        var bullet = new Bullet(data[1], data[2], {x: data[3], y: data[4]}, data[5], game);
        bullet.id  = data[0];
        game.bullets[bullet.id] = bullet;
    });

    this.socket.on("HitPlayer", (hit) => {
      if (game.tanks[hit.playerID]) {
        game.tanks[hit.playerID].life = hit.player.life;
        game.tanks[hit.playerID].isAlive = hit.player.isAlive;

        var text = new UIText(hit.player.pos, hit.damage);
        game.ui.add(text)

        delete game.bullets[hit.bulletID];

        // Delete tank
        if (!hit.player.isAlive) {
          if (hit.playerID != this.id) {
            delete game.tanks[hit.playerID];
          } else {
            game.htmlUI.displayTop(hit.player.top);
            game.tanks[hit.playerID].isSpectator = true;
          }
        }
      }
    });

      this.socket.on("Winner", (winner) => {
        if (this.id == winner.id) {
          game.htmlUI.displayTop(winner.top);
        }
      });

    this.socket.on("MissileDelete", (id) => {
        for (var key in game.bullets) {
            if( game.bullets[key].id == id) {
                delete game.bullets[key];
                break;
            }
        }
    });

    this.socket.on("RemovePlayer", (data) => {
      delete game.tanks[data.id];
    });

    this.socket.on("roomVote", (data) => {
      game.htmlUI.updateRoomVote(data);
    });

    this.socket.on("GoSpeed", (id) => {
      game.tanks[id].speedBonus = 5;
    })

    this.socket.on("StopSpeed", (id) => {
      if (game.tanks[id]) {
        game.tanks[id].speedBonus = 1;
        game.tanks[id].speedEffect = [];
      }
    })
  }

  updatePos(data) {
      data.roomID = this.room.id;
      this.socket.emit('UpdatePlayerPosition', data);
  }

  Shoot() {
    var data = {
      0: this.id,
      1: this.room.id
    };

    this.socket.emit('Shoot', data);
  }

  lookingForRoom(pseudo) {
      if (!this.isLookingForRoom) {
          this.isLookingForRoom = true;

          // @todo: Move to UI Class.
          document.querySelector(".network-ready .state").innerHTML = "Looking for room...";

          this.pseudo = pseudo ? pseudo : document.querySelector(".pseudo").value;

          this.socket.emit('JoinRoom', {
              id: this.id,
              pseudo: this.pseudo,
          } );
      }
  }

  reset() {
      this.isLookingForRoom      = false;
      this.room                  = undefined;
      this.pseudo                = '';
      this.startTime             = undefined;
      this.latency               = 0;
      this.messages              = [];
      this.pending_inputs        = [];
      this.input_sequence_number = 0;
  }

  start(roomID) {
    this.socket.emit('Start', roomID);
  }

  update() {
    this.startTime = +Date.now();

    this.processServerMessage();
    this.processInput();
    this.interpolateEntities();
  }

  processServerMessage() {
    while (true) {
        var messages = this.getAvailableMessage();

        if (!messages) {
            break;
        }

        for (var i = 0; i < messages.world_state.length; i++) {
            var state = messages.world_state[i];

            var entity = this.game.tanks[state[0]];

            if (state[0] == this.id) {

                entity.pos.x      = state[2];
                entity.pos.y      = state[3];
                entity.angle      = state[12];
                entity.canonAngle = state[4];

                var j = 0;
                while (j < this.pending_inputs.length) {
                    var input = this.pending_inputs[j];
                    if (input[7] <= state[7]) {
                        this.pending_inputs.splice(j, 1);
                    } else {
                        entity.applyInput(input);
                        j++;
                    }
                }
            } else {
                if( entity ) {
                    var timestamp = +new Date();
                    entity.position_buffer.push([
                      timestamp,
                      state[2],
                      state[3],
                      state[12],
                      state[4]]);
                }
            }
        }
    }
  }

  getAvailableMessage() {
      let now = +new Date();
      for (let i = 0; i < this.messages.length; i++) {
          let message = this.messages[i];
          if (message.recv_ts <= now) {
              this.messages.splice(i, 1);
              return {
                world_state: message.world_state,
                bullets: message.bullets
              };
          }
      }
  }

  processInput() {
    var now_ts = +new Date();
    var last_ts = this.last_ts || now_ts;
    var dt_sec = (now_ts - last_ts) / 1000.0;
    this.last_ts = now_ts;

    var input = {};

    input[8] = 0; // UP
    input[9] = 0; // LEFT
    input[10] = 0; // RIGHT
    input[11] = 0; // DOWN

    if (this.game.input.keyPressed.up || this.game.input.keyPressed.Z) {
      input[8] = dt_sec;
    }

    if (this.game.input.keyPressed.left || this.game.input.keyPressed.Q) {
      input[9] = dt_sec;
    }

    if (this.game.input.keyPressed.right || this.game.input.keyPressed.D) {
      input[10] = dt_sec;
    }

    if (this.game.input.keyPressed.down || this.game.input.keyPressed.S) {
      input[11] = dt_sec;
    }

    this.game.tanks[this.id].update();

    input[4] = Utils.radiansToDegrees(this.game.tanks[this.id].canonAngle);
    // input[6] = this.game.tanks[this.id].shoot;
    input[7] = this.input_sequence_number++;
    input[0] = this.id;
    input[1] = this.latency;
    input[13] = this.room.id;
    this.socket.emit(0, input);

    this.game.tanks[this.id].shoot = false;
    this.game.tanks[this.id].goSpeed = false;
    this.game.tanks[this.id].applyInput(input);

    this.pending_inputs.push(input);
  }

  interpolateEntities() {
    var now = +new Date();
    var render_timestamp = now - (1000.0 / 10);
    for (var i in this.game.tanks) {
      var entity = this.game.tanks[i];

      if (entity.id == this.id) {
          continue;
      }

      var buffer = entity.position_buffer;

      while (buffer.length >= 2 && buffer[1][0] <= render_timestamp) {
        buffer.shift();
      }

      if (buffer.length >= 2 && buffer[0][0] <= render_timestamp && render_timestamp <= buffer[1][0]) {
        var t0          = buffer[0][0];
        var t1          = buffer[1][0];
        var x0          = buffer[0][1];
        var x1          = buffer[1][1];
        var y0          = buffer[0][2];
        var y1          = buffer[1][2];
        var angle0      = buffer[0][3];
        var angle1      = buffer[1][3];
        var canonAngle0 = buffer[0][4];
        var canonAngle1 = buffer[1][4];

        entity.pos.x      = x0 + (x1 - x0) * (render_timestamp - t0) / (t1 - t0);
        entity.pos.y      = y0 + (y1 - y0) * (render_timestamp - t0) / (t1 - t0);
        entity.angle      = angle0 + (angle1 - angle0) * (render_timestamp - t0) / (t1 - t0);
        entity.canonAngle = canonAngle0 + (canonAngle1 - canonAngle0) * (render_timestamp - t0) / (t1 - t0);
      }
    }
  }

  leaveRoom() {
    this.socket.emit('leaveRoom', {
      id: this.id,
      roomID: this.roomID
    });
  }
}
