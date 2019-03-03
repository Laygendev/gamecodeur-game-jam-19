var UtilsObject = module ? require('./utils.js') : Utils;

class Entity  {
  constructor(id, game, pos) {
    this.id = id;
    this.game = game;
    this.posCanon = {x: 0, y: 0};
    this.posCanonServer = {x: 0, y: 0};
    this.pos = pos;
    this.last_processed_input = 0;
    this.posLife = {
        x: pos.x,
        y: pos.y
    };

    this.speed = 300;
    this.speedRotation = 150;
    this.angleMove = 0;
    this.angle = 0;
    this.canonAngle = 0;

    if (this.game) {
      this.width = this.game.ressources['tank'].width;
      this.height = this.game.ressources['tank'].height;
    }

    this.position_buffer = [];

    this.colliderPoint = [];

    this.colliderPoint[0] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: -35,
            y: 25
        }
    };
    this.colliderPoint[1] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 35,
            y: 25
        }
    };
    this.colliderPoint[2] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 35,
            y: -25
        }
    };
    this.colliderPoint[3] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: -35,
            y: -25
        }
    };

    this.colliderPointServer = [];

    this.colliderPointServer[0] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: -35,
            y: 25
        }
    };
    this.colliderPointServer[1] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 35,
            y: 25
        }
    };
    this.colliderPointServer[2] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: 35,
            y: -25
        }
    };
    this.colliderPointServer[3] = {
        pos: {
            x: 0,
            y: 0,
        },
        offset: {
            x: -35,
            y: -25
        }
    };
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

    this.angle -= input.left_press_time * this.speedRotation;
    this.angle += input.right_press_time * this.speedRotation;

    this.pos.x += input.up_press_time * this.speed * Math.cos(this.angleMove);
    this.pos.y += input.up_press_time * this.speed * Math.sin(this.angleMove);
  }
}

if (module) {
  module.exports = Entity;
}
