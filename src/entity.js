class Entity  {
  id;
  container;
  sprite;
  game;
  pos;
  posCanon;
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
  timerUpdate;
  colliderPoint = [];
  width;
  height;

  constructor(id, game, pos) {
    this.id = id;
    this.game = game;
    this.posCanon = {x: 0, y: 0};
    this.pos = pos;
    this.posLife = {
        x: pos.x,
        y: pos.y
    };

    this.speed = 300;
    this.speedRotation = 100;
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
  }

  update() {
  }

  draw() {
      this.game.ctx.save();
      this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y - this.game.camera.y);
      this.game.ctx.rotate(this.angle * Math.PI / 180);

      this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);
      this.game.ctx.restore();

       this.game.ctx.save();
       this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y  - this.game.camera.y);
       this.game.ctx.rotate(radians_to_degrees(this.canonAngle) * Math.PI / 180);

       this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
       this.game.ctx.restore();

       this.game.ctx.drawImage(this.game.ressources['endcanon'], this.posCanon.x, this.posCanon.y);
       //
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

           this.game.ctx.fillRect(this.colliderPoint[i].pos.x, this.colliderPoint[i].pos.y, 5, 5);
       }
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
    this.game.particleDestroy.emitParticleAt(this.pos.x, this.pos.y);
    this.game.particleDestroy2.emitParticleAt(this.pos.x, this.pos.y);
    this.container.destroy();
    this.endcanon.destroy();

    for(var key in this.bullets) {
      this.bullets[key].sprite.destroy();
      this.bullets.splice(key, 1);
    }
  }
}
