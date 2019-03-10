var UtilsObject = module ? require('./utils.js') : Utils;
var Collider    = module ? require('./collider.js') : undefined;


class Bullet {
  constructor(playerID, roomID, pos, angle, game) {
    this.id            = +new Date().getTime();
    this.playerID      = playerID;
    this.roomID        = roomID;
    this.initPos       = {x: pos.x, y: pos.y};
    this.pos           = {x: pos.x, y: pos.y};
    this.angle         = angle;
    this.speed         = 1500;
    this.distanceMax   = 800;
    this.game          = game;
    this.needToDeleted = false;
  }

  update(dt) {
    if (!this.needToDeleted) {
      this.pos.x += this.speed * Math.cos(UtilsObject.degreesToRadians(this.angle)) * dt;
      this.pos.y += this.speed * Math.sin(UtilsObject.degreesToRadians(this.angle)) * dt;

      if (!this.game) {
        var dist = Math.sqrt( Math.pow((this.initPos.x-this.pos.x), 2) + Math.pow((this.initPos.y-this.pos.y), 2) );
        if (dist >= this.distanceMax) {
            this.needToDeleted = true;
        }
      }
    }
  }

  collision(players) {
    for (var key_player in players) {
      if ( players[key_player].id != this.playerID && players[key_player].isAlive ) {

        if (Collider.OBB(players[key_player].colliderPoint, this.pos)) {
          players[key_player].life--;

          if (players[key_player].life <= 0) {
            players[key_player].isAlive = false;
          }

            var hit = {
              damage: 10,
              bulletID: this.bulletid,
              playerID: players[key_player].id,
              player: {
                pos: players[key_player].pos,
                life: players[key_player].life,
                isAlive: players[key_player].isAlive,
                top: this.numberPlayerAlive + 1
              }
            };

            this.needToDeleted = true;
            return hit;
        }
      }
    }

    return undefined;
  }

  draw(dt) {
    if (this.game.tanks[this.playerID]) {
      var distance = Math.sqrt(sqr(this.game.tanks[this.playerID].pos.y - this.pos.y) + sqr(this.game.tanks[this.playerID].pos.x - this.pos.x));

      if (distance > 10) {
        for (var i = 0; i < 50; i++) {
          this.game.ctx.save();

          var copy = {
            x: this.pos.x,
            y: this.pos.y
          };

          copy.x -= i * 200 * dt * Math.cos(UtilsObject.degreesToRadians(this.angle));
          copy.y -= i * 200 * dt * Math.sin(UtilsObject.degreesToRadians(this.angle));

          this.game.ctx.translate(copy.x - this.game.camera.x + this.game.ressources['fire'].width, copy.y - this.game.camera.y + this.game.ressources['fire'].height);
          this.game.ctx.rotate(this.angle);
          this.game.ctx.globalAlpha = (1 / i);

          this.game.ctx.drawImage(this.game.ressources['fire'], -this.game.ressources['fire'].width / 2, -this.game.ressources['fire'].height / 2);
          this.game.ctx.restore();
        }
      }
    }

    this.game.ctx.save();

    this.game.ctx.translate(this.pos.x - this.game.camera.x + this.game.ressources['fire'].width, this.pos.y - this.game.camera.y + this.game.ressources['fire'].height);
    this.game.ctx.rotate(UtilsObject.degreesToRadians(this.angle));

    this.game.ctx.drawImage(this.game.ressources['fire'], -this.game.ressources['fire'].width / 2, -this.game.ressources['fire'].height / 2);
    this.game.ctx.restore();
  }
}

if (module) {
  module.exports = Bullet;
}
