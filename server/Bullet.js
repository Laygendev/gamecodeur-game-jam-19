var Entity = require('./Entity');
var Constants = require('./Constants');

class Bullet extends Entity {
  constructor(position, angle, playerID) {
    super(position);

    this.position = position;
    this.angle = angle;
    this.playerID = playerID;

    this.initPos = JSON.parse(JSON.stringify(position));
    this.speed = 1500;
    this.distanceMax = 800;
    this.needToDeleted = false;
  }

  update(room, clients, dt) {
    if (!this.needToDeleted) {
      this.position[0] += this.speed * Math.cos(this.angle) * dt;
      this.position[1] += this.speed * Math.sin(this.angle) * dt;

      var dist = Math.sqrt( Math.pow((this.initPos[0] - this.position[0]), 2) + Math.pow((this.initPos[1] - this.position[1]), 2) );
      if (dist >= this.distanceMax) {
          this.needToDeleted = true;
      }
    }

    var players = clients.values();
    for (var i = 0; i < players.length; ++i) {
      if (this.playerID != players[i].id && !players[i].death &&
          players[i].isCollidedWith(this.getX(), this.getY(),
                                    Constants.BULLET_HITBOX_SIZE)) {
        var killingPlayer = null;

        if (room.isStarted) {
          players[i].damage(1);
        }

        room.server.io.to(room.id).emit('room-update-ui', { hit: {
          position: players[i].position
        }});

        if (players[i].death) {
          killingPlayer = clients.get(this.playerID);
          killingPlayer.kills++;
        }

        this.needToDeleted = true;
        return {
          hitPlayer: players[i],
          killingPlayer: killingPlayer
        };
      }
    }
  }
}

module.exports = Bullet;
