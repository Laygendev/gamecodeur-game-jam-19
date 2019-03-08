var UtilsObject = module ? require('./utils.js') : Utils;

// var worldColliderServer = module ? require('./../asset/worldCollider.json') : undefined;

class Entity  {
  constructor(id = 0, room = undefined, game = undefined, pos = undefined) {
    this.id                   = id;
    this.game                 = game;
    this.pos                  = pos ? pos : {x: 0, y: 0};
    this.room                 = room;
    this.speed                = 300;
    this.speedRotation        = 150;
    this.angleMove            = 0;
    this.angle                = 0;
    this.canonAngle           = 0;
    this.posCanon             = {x: 0, y: 0};
    this.posCanonServer       = {x: 0, y: 0};
    this.last_processed_input = 0;
    this.posLife              = { x: this.pos.x, y: this.pos.y };

    if (this.game) {
      this.width  = this.game.ressources['tank'].width;
      this.height = this.game.ressources['tank'].height;
    }

    this.position_buffer = [];
    this.colliderPoint   = [];

    this.colliderPoint[0] = { pos: { x: this.pos.x, y: this.pos.y }, offset: { x: -35, y: 25 } };
    this.colliderPoint[1] = { pos: { x: this.pos.x, y: this.pos.y }, offset: { x: 35, y: 25 } };
    this.colliderPoint[2] = { pos: { x: this.pos.x, y: this.pos.y }, offset: { x: 35, y: -25 } };
    this.colliderPoint[3] = { pos: { x: this.pos.x, y: this.pos.y }, offset: { x: -35, y: -25 } };

    this.colliderPointServer = JSON.parse(JSON.stringify(this.colliderPoint));
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;

    this.posLife.x = this.pos.x;
    this.posLife.y = this.pos.y;

    this.colliderPoint[0] = { pos: { x: this.pos.x - 35, y: this.pos.y + 25 }, offset: { x: -35, y: 25 } };
    this.colliderPoint[1] = { pos: { x: this.pos.x + 35, y: this.pos.y - 25 }, offset: { x: 35, y: 25 } };
    this.colliderPoint[2] = { pos: { x: this.pos.x + 35, y: this.pos.y - 25 }, offset: { x: 35, y: -25 } };
    this.colliderPoint[3] = { pos: { x: this.pos.x - 35, y: this.pos.y - 25 }, offset: { x: -35, y: -25 } };

    this.colliderPointServer = JSON.parse(JSON.stringify(this.colliderPoint));
  }

  update() {
    for( var i = 0; i < 4; i++) {
        var currentPos = {
            x: this.pos.x - this.game.camera.x - this.colliderPoint[i].offset.x,
            y: this.pos.y - this.game.camera.y - this.colliderPoint[i].offset.y
        };

        var currentPosSource = {
            x: this.pos.x - this.game.camera.x,
            y: this.pos.y - this.game.camera.y
        };

        this.colliderPoint[i].pos.x = (currentPos.x - currentPosSource.x) * Math.cos(UtilsObject.degreesToRadians(this.angle)) - (currentPos.y - currentPosSource.y) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.x;
        this.colliderPoint[i].pos.y = (currentPos.y - currentPosSource.y) * Math.cos(UtilsObject.degreesToRadians(this.angle)) + (currentPos.x - currentPosSource.x) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.y;

        var currentPos = {
            x: this.pos.x - this.colliderPoint[i].offset.x,
            y: this.pos.y - this.colliderPoint[i].offset.y
        };

        // Without Camera scrolling.
        var currentPosSource = {
            x: this.pos.x,
            y: this.pos.y
        };

        this.colliderPointServer[i].pos.x = (currentPos.x - currentPosSource.x) * Math.cos(UtilsObject.degreesToRadians(this.angle)) - (currentPos.y - currentPosSource.y) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.x;
        this.colliderPointServer[i].pos.y = (currentPos.y - currentPosSource.y) * Math.cos(UtilsObject.degreesToRadians(this.angle)) + (currentPos.x - currentPosSource.x) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.y;
      }
  }

  applyInput(input) {
    this.colliderPointServer = input.colliderPointServer;
    this.posCanonServer = input.posCanonServer;
    this.canonAngle = input.canonAngle;

    this.angleMove = UtilsObject.degreesToRadians(this.angle);

    // this.angle -= input.left_press_time * this.speedRotation;
    // this.angle += input.right_press_time * this.speedRotation;

    let tmpPos = { x: this.pos.x, y: this.pos.y };
    let nextPos = { x: this.pos.x, y: this.pos.y };


    if (input.right_press_time) {
      this.pos.x += input.right_press_time * this.speed;
      nextPos.x = this.pos.x + 10;
    } else if (input.left_press_time) {
      this.pos.x -= input.left_press_time * this.speed;
      nextPos.x = this.pos.x - 10;
    }

    if (input.up_press_time) {
      this.pos.y -= input.up_press_time * this.speed;
      nextPos.y = this.pos.y - 10;
    } else if(input.down_press_time) {
      this.pos.y += input.down_press_time * this.speed;
      nextPos.y = this.pos.y + 10;
    }

    this.angle = UtilsObject.radiansToDegrees(Math.atan2(nextPos.y - this.pos.y, nextPos.x - this.pos.x));

    var haveCollision = false;

    if (!module) {
      // haveCollision = this.game.world.checkCollision();
    }
    //
    // if (tmpPos.x >= 0 && tmpPos.x <= this.room.width && !haveCollision ) {
    //   this.pos.x += input.up_press_time * this.speed * Math.cos(this.angleMove);
    // }
    //
    // if (tmpPos.y >= 0 && tmpPos.y <= this.room.height && !haveCollision ) {
    //   this.pos.y += input.up_press_time * this.speed * Math.sin(this.angleMove);
    // }
  }

  shoot() {
    var bullet = {
      'roomID': this.room.id,
      'id': this.id,
      'bulletid': new Date().getTime(),
      'basePos': JSON.parse(JSON.stringify(this.posCanonServer)),
      'speed': 2500,
      'distanceMax': 800,
      'endcanonangle': UtilsObject.radiansToDegrees(this.canonAngle),
      'angleRadians': this.canonAngle,
      'pos': JSON.parse(JSON.stringify(this.posCanonServer))
    };

    this.room.addBullet(bullet);
    return bullet;
  }
}

if (module) {
  module.exports = Entity;
}
