class Entity  {
  id;
  container;
  sprite;
  game;
  pos;
  posCanon;
  posCanonServer;
  angle;
  speed;
  speedRotation;
  bullets = [];
  particles;
  particleDestroy;
  particleDestroy2;
  target;
  maxlife;
  life;
  posLife;
  alive = true;
  isSpectator = false;
  timerUpdate;
  colliderPoint = [];
  colliderPointServer = [];
  width;
  height;

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

    this.speed = 300;
    this.speedRotation = 200;
    this.angleMove = 0;
    this.angle = 0;
    this.canonAngle = 0;
    this.width = this.game.ressources['tank'].width;
    this.height = this.game.ressources['tank'].height;

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
}
