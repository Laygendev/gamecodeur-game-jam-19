var Collider = require('./collider.js');
var Utils    = require('./utils.js');

class Room {
    constructor(io, width, height) {
        this.io           = io;
        this.id           = new Date().getTime();
        this.numberPlayer = 0;
        this.maxPlayer    = 10;
        this.players      = [];
        this.bullets      = [];
        this.isStarted    = false;
        this.width        = height;
        this.height       = width;
        this.messages     = [];
        this.isFinish     = false;
    }

    add(player) {
        this.players[player.id] = player;
        this.numberPlayer++;
    }

    delete(playerID) {
      delete this.players[playerID];
      this.numberPlayer--;

      if (this.isStarted) {
        this.io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);
      } else {
        this.io.to(this.id).emit("UpdateWaitingRoomMessage", {
          id: this.id,
          numberPlayer: this.numberPlayer,
          maxPlayer: this.maxPlayer
        });
      }
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
                x: Math.floor(Math.random() * (this.width - 100)) + 100,
                y: Math.floor(Math.random() * (this.height - 100)) + 100,
            };

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
                width: this.width,
                height: this.height,
              }
            });

            this.players[key].socket.broadcast.to(this.players[key].roomID).emit("addPlayer", { player: dataPlayer });
        }

        this.io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);

    }

    update(dt) {
      for (var key in this.bullets) {
          this.bullets[key].pos.x += this.bullets[key].speed * Math.cos(this.bullets[key].angleRadians) * dt;
          this.bullets[key].pos.y += this.bullets[key].speed * Math.sin(this.bullets[key].angleRadians) * dt;

          var destroyBullet = false;

          var playerHit = undefined

          for(var key_player in this.players) {
              if ( this.players[key_player].id != this.bullets[key].id && this.players[key_player].isAlive ) {
                  if (Collider.OBB(this.players[key_player].colliderPointServer, this.bullets[key].pos)) {
                    this.players[key_player].life--;

                    if (this.players[key_player].life <= 0) {
                      this.players[this.bullets[key].id].kill++;
                      this.players[key_player].isAlive = false;
                      this.numberPlayer--;
                      this.io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);
                      this.io.to(this.bullets[key].id).emit("UpdateKill", this.players[this.bullets[key].id].kill);
                      this.io.to(this.bullets[key].roomID).emit("Message", this.players[this.bullets[key].id].pseudo + ' à pulvérisé ' + this.players[key_player].pseudo );
                      this.checkWinner();
                    }
                      var hit = {
                        damage: 10,
                        bulletID: this.bullets[key].bulletid,
                        playerID: this.players[key_player].id,
                        player: {
                          pos: this.players[key_player].pos,
                          life: this.players[key_player].life,
                          isAlive: this.players[key_player].isAlive,
                          top: this.numberPlayer + 1
                        }
                      };

                      this.io.to(this.bullets[key].roomID).emit("HitPlayer", hit);
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
              this.io.to(this.bullets[key].roomID).emit("MissileDelete", this.bullets[key]);
              this.bullets.splice(key, 1);
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

        var entity = this.players[id];

        if (entity) {
          if (message.shoot) {
            var bullet = entity.shoot();
            this.io.to(room_id).emit("Shoot", bullet);
          }

          entity.applyInput(message);
          entity.last_processed_input = message.input_sequence_number;
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
    				last_processed_input: this.players[key].last_processed_input
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

        this.io.to(this.id).emit("Winner", {
          id: winner.id,
          pseudo: winner.pseudo,
          top: 1
        });

        this.isFinish = true;
      }
    }

    remove(player) {

    }
}

module.exports = Room;
