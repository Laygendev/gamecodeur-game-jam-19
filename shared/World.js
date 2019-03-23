var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants;
var SharedUtil = typeof module === 'object' ? require('./Util') : Util;

class World {
  constructor(collider, game) {
    this.collider = collider;
    this.game = game;

    if (typeof module === 'object') {
      this.collider = require('./../asset/worldCollider.json');
    }
  }

  static getRandomPoint() {
      return [SharedUtil.randRange(SharedConstants.WORLD_MIN,
                              SharedConstants.WORLD_MAX),
              SharedUtil.randRange(SharedConstants.WORLD_MIN,
                              SharedConstants.WORLD_MAX)];
  }

  checkCollider(pos, nextPos) {
    var haveCollider = false;
    for (var key in this.collider) {
      for (var i = 0; i < this.collider[key].length; i++) {
        var A = this.collider[key][i];
        var B;
        if (i == this.collider[key].length - 1) {
          B = this.collider[key][0]
        } else {
          B = this.collider[key][i + 1];
        }

        A[0] = A.x;
        A[1] = A.y;
        B[0] = B.x;
        B[1] = B.y;
        haveCollider = SharedUtil.CollisionSegSeg(pos, nextPos, A, B);

        if (haveCollider)
          break;
      }

      if (haveCollider)
        break;
    }

    return haveCollider;
  }

  draw() {
    if (this.collider ) {
      for (var key in this.collider) {
        this.game.ctx.save();
        switch (key) {
          case 'ile0':
            this.game.ctx.fillStyle = "#1abc9c";
            break;
          case 'ile1':
            this.game.ctx.fillStyle = "#3498db";
            break;
          case 'ile2':
            this.game.ctx.fillStyle = "#f1c40f";
            break;
          case 'ile3':
            this.game.ctx.fillStyle = "#e74c3c";
            break;

        }
        for (var i = 0; i < this.collider[key].length; i++) {
          this.game.ctx.fillRect(this.collider[key][i].x - this.game.camera.x, this.collider[key][i].y - this.game.camera.y, 10, 10 );
        }
        this.game.ctx.restore();
      }
    }
  }
}

if (typeof module === 'object') {
  module.exports = World;
}
