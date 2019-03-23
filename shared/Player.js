var SharedEntity = typeof module === 'object' ? require('./Entity') : Entity;
var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants;
var SharedUtil = typeof module === 'object' ? require( './Util') : Util;
var SharedWorld = typeof module === 'object' ? require( './World') : World;

class Player extends SharedEntity {
  constructor(position, orientation, name, id, screen) {
    super(position);

    this.position = position;
    this.orientation = orientation;
    this.name = name;
    this.id = id;
    this.screen = screen;

    this.turretAngle = orientation;
    this.velocity = [0, 0];
    this.friction = 0.95;

    this.speed = SharedConstants.DEFAULT_SPEED;

    this.lastShotTime = 0;
    this.shotCooldown = SharedConstants.DEFAULT_SHOT_COOLDOWN;

    this.lastSpeedTime = 0;
    this.canSpeed = true;
    this.speedCooldown = SharedConstants.DEFAULT_SPEED_COOLDOWN;

    this.timerSpeedTime = 0;

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

  updateOnInput(input, world) {
    this.turretAngle = input[3];

    var haveCollision = false;
    let tmpTestPos = [this.position[0], this.position[1]];
    var forwardPos = [this.position[0], this.position[1]];
    var someKeyIsPressed = false;
    var testVelocity = [this.velocity[0], this.velocity[1]];

    if (this.speed > SharedConstants.DEFAULT_SPEED) {
      this.speed -= 100;
    } else {
      this.speed = SharedConstants.DEFAULT_SPEED;
    }

    if (input[12]) {
      this.canSpeed = false;
      this.speed = SharedConstants.DEFAULT_SPEED_MAX;
      this.lastSpeedTime = (new Date()).getTime();
    }

    if (input[8]) {
      this.velocity[1] = -(input[8] * this.speed);
      testVelocity[1] = -(input[8] * this.speed) - 30;
    } else if (input[11]) {
      this.velocity[1] = input[11] * this.speed;
      testVelocity[1] = (input[8] * this.speed) + 30;
    }

    if (input[9]) {
      this.velocity[0] = -(input[9] * this.speed);
      testVelocity[0] = -(input[8] * this.speed) - 30;
    } else if (input[10]) {
      this.velocity[0] = input[10] * this.speed;
      testVelocity[0] = (input[8] * this.speed) + 30;

    }

    if (input[8] || input[10] || input[9] || input[11]) {
      someKeyIsPressed = true;
    }

    if (!input[8] && !input[11]) {
      this.velocity[1] = 0;
      testVelocity[1] = 0;
    }

    if (!input[9] && !input[10]) {
      this.velocity[0] = 0;
      testVelocity[0] = 0;
    }

    this.velocity[0] *= this.friction;
    this.velocity[1] *= this.friction;

    testVelocity[0] *= this.friction;
    testVelocity[1] *= this.friction;

    forwardPos[0] += testVelocity[0];
    forwardPos[1] += testVelocity[1];

    tmpTestPos[0] += this.velocity[0];
    tmpTestPos[1] += this.velocity[1];

    haveCollision = world.checkCollider(this.position, forwardPos);

    if (tmpTestPos[0] >= 0 && tmpTestPos[0] <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[0] = tmpTestPos[0];
    }

    if (tmpTestPos[1] >= 0 && tmpTestPos[1] <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[1] = tmpTestPos[1];
    }

    if (someKeyIsPressed) {
      this.orientation = Math.atan2(forwardPos[1] - this.position[1], forwardPos[0] - this.position[0]);
    }
  }

  update() {

  }

  canShoot() {
    return (new Date()).getTime() > this.lastShotTime + this.shotCooldown && !this.death;
  }

  canISpeed() {
    return (new Date()).getTime() > this.lastSpeedTime + this.speedCooldown && !this.death;
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
