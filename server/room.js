var Collider = require('./collider.js');
var Utils    = require('./utils.js');
var BulletObject = module ? require('./bullet.js') : undefined;


class Room {
    constructor(sockets, io, width, height) {
      this.sockets        = sockets;
        this.io           = io;
        this.id           = new Date().getTime();
        this.numberPlayer = 0;
        this.numberPlayerAlive = 0;
        this.maxPlayer    = 100;
        this.players      = [];
        this.bullets      = [];
        this.isStarted    = false;
        this.width        = height;
        this.height       = width;
        this.messages     = [];
        this.isFinish     = false;
        this.votes        = [];
    }

    add(player) {
        this.players[player.id] = player;
        this.votes[player.id] = {
          id: player.id,
          ok: undefined
        };

        this.numberPlayer++;
    }

    addVote(vote) {
      this.votes[vote.id] = vote;
    }

    checkNumberVote() {
      var numberVoteOk = 0;

      for (var key in this.votes) {
        if (this.votes[key].ok == true) {
          numberVoteOk++;
        }
      }

      if (numberVoteOk >= this.numberPlayer / 2) {
        this.start();
      }
    }

    delete(playerID) {
      delete this.players[playerID];
      delete this.votes[playerID];
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
      this.numberPlayerAlive = this.numberPlayer;
        for (var key in this.players) {
            this.players[key].life = 5;
            this.players[key].isAlive = true;

            this.players[key].setPos(Math.floor(Math.random() * (this.width - 100)) + 100, Math.floor(Math.random() * (this.height - 100)) + 100)

            let dataPlayer = {
              id: this.players[key].id,
              pseudo: this.players[key].pseudo,
              life: this.players[key].life,
              alive: this.players[key].isAlive,
              pos: this.players[key].pos
            };

            this.sockets[this.players[key].id].emit("spawnPlayer", {
              player: dataPlayer,
              map: {
                width: this.width,
                height: this.height,
              }
            });

            this.sockets[this.players[key].id].broadcast.to(this.players[key].roomID).emit("addPlayer", { player: dataPlayer });
        }

        this.io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayer);
    }

    update(dt) {
      for (var key in this.bullets) {
        this.bullets[key].update(dt);
        var hitInfo = this.bullets[key].collision(this.players);

        if (hitInfo) {

          if (!hitInfo.player.isAlive) {
            this.numberPlayerAlive--;
            this.players[this.bullets[key].playerID].kill++;

            this.io.to(this.id).emit("UpdateNumberPlayer", this.numberPlayerAlive);
            this.io.to(this.bullets[key].playerID).emit("UpdateKill", this.players[this.bullets[key].playerID].kill);
            this.io.to(this.id).emit("Message", this.players[this.bullets[key].playerID].pseudo + ' à pulvérisé ' + this.players[hitInfo.playerID].pseudo );
          }

          this.io.to(this.id).emit("HitPlayer", hitInfo);
        }

        if (this.bullets[key].needToDeleted) {
          this.io.to(this.id).emit("MissileDelete", this.bullets[key].id);
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

        var id      = message[0];
        var room_id = message[13];

        var entity = this.players[id];

        if (entity) {

          // if (message.goSpeed) {
          //   entity.speedBonus = 5;
          //   // entity.socket.emit("GoSpeed", entity.id);
          // }

          entity.applyInput(message);
          entity.last_processed_input = message[7];
        }
      }
    }


    sendWorldState() {
      var data = {
    		send_ts: +new Date(),
    		world_state: [],
    	};

    	for (var key in this.players) {
    		if ( this.players[key] ) {
    			data.world_state.push({
    				0: this.players[key].id,
    				2: this.players[key].pos.x,
            3: this.players[key].pos.y,
            4: this.players[key].canonAngle,
            12: this.players[key].angle,
            7: this.players[key].last_processed_input
    			});
    		}
    	}

    	for (var key in this.players) {
        data[1] = this.players[key].lag;
        this.sockets[key].emit('1', data);
      }

    }

    checkWinner() {
      if (this.numberPlayerAlive == 1) {
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

    shoot(data) {
      var entity = this.players[data[0]];
      var bullet = new BulletObject(data[0], data[1], JSON.parse(JSON.stringify(entity.posCanon)), entity.canonAngle, undefined);
      this.addBullet(bullet);

      this.io.to(data[1]).emit("Shoot", {
        0: bullet.id,
        1: bullet.playerID,
        2: bullet.roomID,
        3: bullet.pos.x,
        4: bullet.pos.y,
        5: bullet.angle
      });
    }
}

module.exports = Room;
