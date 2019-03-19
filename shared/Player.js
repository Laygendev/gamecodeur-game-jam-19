var SharedEntity = typeof module === 'object' ? require('./Entity') : Entity;
var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants;
var SharedUtil = typeof module === 'object' ? require( './Util') : Util;
var SharedWorld = typeof module === 'object' ? require( './World') : World;

class Player extends SharedEntity {
  constructor(position, orientation, name, id, screen) {
    super(position);

    this.position = position;
    this.orientation = orientation;
    this.turretAngle = orientation;
    this.name = name;
    this.id = id;
    this.screen = screen;

    this.speed = 300;

    this.lastShotTime = 0;
    this.shotCooldown = SharedConstants.DEFAULT_SHOT_COOLDOWN;

    this.lastProcessedInput = 0;
    this.positionBuffer = [];
    this.waitMessage = true;

    this.hitboxSize = SharedConstants.DEFAULT_HITBOX_SIZE;

    this.health = SharedConstants.PLAYER_MAX_HEALTH;

    this.kills = 0;
    this.death = false;
  }

  static generateNewPlayer(name, id, screen) {
    var point = SharedWorld.getRandomPoint();
    var orientation = SharedUtil.randRange(0, 2 * Math.PI);
    return new Player(point, orientation, name, id, screen);
  }

  updateOnInput(input) {
    let tmpTestPos = { x: this.position[0], y: this.position[1] };
    var forwardPos = { x: this.position[0], y: this.position[1] };
    var someKeyIsPressed = false;
    var haveCollision = false;

    this.turretAngle = input[3];

    if (input[8]) {
      tmpTestPos.y -= input[8] * this.speed;
      forwardPos.y = tmpTestPos.y - 30;
    } else if (input[11]) {
      tmpTestPos.y += input[11] * this.speed;
      forwardPos.y = tmpTestPos.y + 30;
    }

    if (input[9]) {
      tmpTestPos.x -= input[9] * this.speed;
      forwardPos.x = tmpTestPos.x - 30;
    } else if(input[10]) {
      tmpTestPos.x += input[10] * this.speed;
      forwardPos.x = tmpTestPos.x + 30;
    }

    if (input[8] || input[10] || input[9] || input[11]) {
      someKeyIsPressed = true;
    }

    if (tmpTestPos.x >= 0 && tmpTestPos.x <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[0] = tmpTestPos.x;
    }

    if (tmpTestPos.y >= 0 && tmpTestPos.y <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[1] = tmpTestPos.y;
    }

    if (someKeyIsPressed) {
      this.orientation = Math.atan2(forwardPos.y - this.position[1], forwardPos.x - this.position[0]);
    }
  }

  canShoot() {
    return (new Date()).getTime() > this.lastShotTime + this.shotCooldown && !this.death;
  }

  isCollidedWith(x, y, hitboxSize) {
    var minDistance = this.hitboxSize + hitboxSize;
    return SharedUtil.getEuclideanDistance2(this.getX(), this.getY(), x, y) <
      (minDistance * minDistance);
  }

  damage(amount) {
    this.health -= amount;

    if (this.health <= 0) {
      this.health = 0;
      this.death = true;
    }
  }
}

if (typeof module === 'object') {
  module.exports = Player;
}
