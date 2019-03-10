var UtilsObject = module ? require('./utils.js') : Utils;
var world = module ? require('./world.js') : undefined;
var worldColliderServer = module ? require('./../asset/worldCollider.json') : undefined;
var BulletObject = module ? require('./bullet.js') : undefined;

if (world) {
  world.setCollider(worldColliderServer);
}

class Entity  {
  constructor(id = 0, room = undefined, game = undefined, pos = undefined) {
    this.id                   = id;
    this.game                 = game;
    this.pos                  = pos ? pos : {x: 0, y: 0};
    this.room                 = room;
    this.speed                = 300;
    this.speedBonus           = 1;
    this.speedRotation        = 150;
    this.angleMove            = 0;
    this.angle                = 0;
    this.canonAngle           = 0;
    this.posCanon             = {x: 0, y: 0};
    this.last_processed_input = 0;
    this.posLife              = { x: this.pos.x, y: this.pos.y };
    this.forwardPos           = { x: this.pos.x, y: this.pos.y };
    this.speedEffect          = [];
    this.kill                 = 0;

    if (this.game) {
      this.width  = this.game.ressources['tank'].width;
      this.height = this.game.ressources['tank'].height;
    }

    this.position_buffer = [];
    this.colliderPoint   = [];

    this.colliderPoint[0] = { x: this.pos.x, y: this.pos.y };
    this.colliderPoint[1] = { x: this.pos.x, y: this.pos.y };
    this.colliderPoint[2] = { x: this.pos.x, y: this.pos.y };
    this.colliderPoint[3] = { x: this.pos.x, y: this.pos.y };

    this.offsetCollider = [];
    this.offsetCollider[0] = {x: -35, y: 25};
    this.offsetCollider[1] = {x: 35, y: 25};
    this.offsetCollider[2] = {x: 35, y: -25};
    this.offsetCollider[3] = {x: -35, y: -25};
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;

    this.posLife.x = this.pos.x;
    this.posLife.y = this.pos.y;

    this.colliderPoint[0] = { x: this.pos.x - 35, y: this.pos.y + 25 };
    this.colliderPoint[1] = { x: this.pos.x + 35, y: this.pos.y - 25 };
    this.colliderPoint[2] = { x: this.pos.x + 35, y: this.pos.y - 25 };
    this.colliderPoint[3] = { x: this.pos.x - 35, y: this.pos.y - 25 };
  }

  update() {
    //
    // for( var i = 0; i < 4; i++) {
    //     var currentPos = {
    //         x: this.pos.x - this.game.camera.x - this.offsetCollider[i].x,
    //         y: this.pos.y - this.game.camera.y - this.offsetCollider[i].y
    //     };
    //
    //     var currentPosSource = {
    //         x: this.pos.x - this.game.camera.x,
    //         y: this.pos.y - this.game.camera.y
    //     };
    //
    //     this.colliderPoint[i].x = (currentPos.x - currentPosSource.x) * Math.cos(UtilsObject.degreesToRadians(this.angle)) - (currentPos.y - currentPosSource.y) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.x;
    //     this.colliderPoint[i].y = (currentPos.y - currentPosSource.y) * Math.cos(UtilsObject.degreesToRadians(this.angle)) + (currentPos.x - currentPosSource.x) * Math.sin(UtilsObject.degreesToRadians(this.angle)) + currentPosSource.y;
    //   }
  }

  applyInput(input) {
    this.canonAngle = input[4];
    // this.posCanon = input[14];

    let tmpTestPos = { x: this.pos.x, y: this.pos.y };
    this.forwardPos = { x: this.pos.x, y: this.pos.y };

    let haveCollision = false;

    //
    // if (this.speedBonus > 1) {
    //   this.speedEffect.push({pos: {x: this.pos.x, y: this.pos.y}, angle: this.angle});
    //   this.speedBonus -= 0.1;
    // } else {
    //   if (!this.game) {
    //       // this.socket.emit('StopSpeed', this.id);
    //   }
    //
    //   this.speedBonus = 1;
    //   this.speedEffect = [];
    // }

    if (input[10]) {
      tmpTestPos.x += input[10] * this.speed;
      this.forwardPos.x = tmpTestPos.x + 30;
    } else if (input[9]) {
      tmpTestPos.x -= input[9] * this.speed;
      this.forwardPos.x = tmpTestPos.x - 30;
    }

    if (input[8]) {
      tmpTestPos.y -= input[8] * this.speed;
      this.forwardPos.y = tmpTestPos.y - 30;
    } else if(input[11]) {
      tmpTestPos.y += input[11] * this.speed;
      this.forwardPos.y = tmpTestPos.y + 30;
    }

    var someKeyIsPressed = false;

    if (input[8] || input[10] || input[9] || input[11]) {
      someKeyIsPressed = true;
    }


    if (!module) {
        haveCollision = this.game.world.checkCollider(this.pos, this.forwardPos);
    } else {
        haveCollision = world.checkCollider(this.pos, this.forwardPos);
    }


    if (tmpTestPos.x >= 0 && tmpTestPos.x <= this.room.width && someKeyIsPressed && ! haveCollision) {
      this.pos.x = tmpTestPos.x;
    }

    if (tmpTestPos.y >= 0 && tmpTestPos.y <= this.room.height && someKeyIsPressed && ! haveCollision) {
      this.pos.y = tmpTestPos.y;
    }

    if (someKeyIsPressed) {
      this.angle = Math.atan2(this.forwardPos.y - this.pos.y, this.forwardPos.x - this.pos.x);
    }

    if (!this.game && this.posCanon) {
      this.posCanon.x = (this.pos.x + (this.pos.x + (100 * Math.cos(UtilsObject.degreesToRadians(this.canonAngle))))) * 0.5;
      this.posCanon.y = (this.pos.y + (this.pos.y + (100 * Math.sin(UtilsObject.degreesToRadians(this.canonAngle))))) * 0.5;
    }

    if (!this.game) {
      for (var i = 0; i < 4; ++i) {
        var currentPos = {
            x: this.pos.x - this.offsetCollider[i].x,
            y: this.pos.y - this.offsetCollider[i].y
        };

        // Without Camera scrolling.
        var currentPosSource = {
            x: this.pos.x,
            y: this.pos.y
        };

        this.colliderPoint[i].x = (currentPos.x - currentPosSource.x) * Math.cos(this.angle) - (currentPos.y - currentPosSource.y) * Math.sin(this.angle) + currentPosSource.x;
        this.colliderPoint[i].y = (currentPos.y - currentPosSource.y) * Math.cos(this.angle) + (currentPos.x - currentPosSource.x) * Math.sin(this.angle) + currentPosSource.y;
      }
    }

  }
}

if (module) {
  module.exports = Entity;
}
