

class Bullet {
  constructor(playerID, roomID, pos, angle) {
    this.id            = +new Date().getTime();
    this.playerID      = playerID;
    this.roomID        = roomID;
    this.initPos       = {x: pos.x, y: pos.y};
    this.pos           = {x: pos.x, y: pos.y};
    this.angle         = angle;
    this.speed         = 1500;
    this.distanceMax   = 800;
    this.needToDeleted = false;

    this.position_buffer = [];
  }

  update(dt) {
    if (!this.needToDeleted) {
      this.pos.x += this.speed * Math.cos(this.angle) * dt;
      this.pos.y += this.speed * Math.sin(this.angle) * dt;

      var dist = Math.sqrt( Math.pow((this.initPos.x-this.pos.x), 2) + Math.pow((this.initPos.y-this.pos.y), 2) );
      if (dist >= this.distanceMax) {
          this.needToDeleted = true;
      }
    }
  }

  collision(players) {
    players.each((key, player) => {
      if ( player.id != this.playerID && player.isAlive ) {

        if (Collider.OBB(player.colliderPoint, this.pos)) {
          player.life--;

          if (player.life <= 0) {
            player.isAlive = false;
          }

            var hit = {
              damage: 10,
              bulletID: this.bulletid,
              playerID: player.id,
              player: {
                pos: player.pos,
                life: player.life,
                isAlive: player.isAlive,
                top: this.numberPlayerAlive + 1
              }
            };

            this.needToDeleted = true;
            this.hitPlayer = hit;
        }
      }
    });
  }

  values() {
    return [this.id, this.pos, this.angle, this.initPos];
  }
}

if (module) {
  module.exports = Bullet;
}
