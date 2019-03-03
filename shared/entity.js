class Entity  {
  constructor(id, game, pos) {
    this.id = id;
    this.game = game;
    this.posCanon = {x: 0, y: 0};
    this.posCanonServer = {x: 0, y: 0};
    this.pos = pos;
    this.posLife = {
        x: pos.x,
        y: pos.y
    };

    this.speed = 200;
    this.speedRotation = 150;
    this.angleMove = 0;
    this.angle = 0;
    this.canonAngle = 0;
    this.width = this.game.ressources['tank'].width;
    this.height = this.game.ressources['tank'].height;

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

        this.colliderPoint[i].pos.x = (currentPos.x - currentPosSource.x) * Math.cos(degrees_to_radians(this.angle)) - (currentPos.y - currentPosSource.y) * Math.sin(degrees_to_radians(this.angle)) + currentPosSource.x;
        this.colliderPoint[i].pos.y = (currentPos.y - currentPosSource.y) * Math.cos(degrees_to_radians(this.angle)) + (currentPos.x - currentPosSource.x) * Math.sin(degrees_to_radians(this.angle)) + currentPosSource.y;

        var currentPos = {
            x: this.pos.x - this.colliderPoint[i].offset.x,
            y: this.pos.y - this.colliderPoint[i].offset.y
        };

        var currentPosSource = {
            x: this.pos.x,
            y: this.pos.y
        };

        this.colliderPointServer[i].pos.x = (currentPos.x - currentPosSource.x) * Math.cos(degrees_to_radians(this.angle)) - (currentPos.y - currentPosSource.y) * Math.sin(degrees_to_radians(this.angle)) + currentPosSource.x;
        this.colliderPointServer[i].pos.y = (currentPos.y - currentPosSource.y) * Math.cos(degrees_to_radians(this.angle)) + (currentPos.x - currentPosSource.x) * Math.sin(degrees_to_radians(this.angle)) + currentPosSource.y;
      }
  }

  draw() {

       //
       // this.posLife.x = this.pos.x + 20;
       // this.posLife.y = this.pos.y;
       //
       // this.game.ctx.fillRect(this.posLife.x, this.posLife.y, 100, 10);
       // this.game.ctx.save();
       // this.game.ctx.fillStyle = "#556B2F";
       // this.game.ctx.fillRect(this.posLife.x, this.posLife.y, this.life * 100 / this.maxlife, 10);
       // this.game.ctx.restore();
       //
       //

  }

  updateAfter() {



  }

  destroy() {
  }

  applyInput(input) {
    this.angleMove = degrees_to_radians(this.angle);

    this.angle -= input.left_press_time * this.speedRotation;
    this.angle += input.right_press_time * this.speedRotation;

    this.pos.x += input.up_press_time * this.speed * Math.cos(this.angleMove);
    this.pos.y += input.up_press_time * this.speed * Math.sin(this.angleMove);
  }
}
