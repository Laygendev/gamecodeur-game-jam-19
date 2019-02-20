class Entity {
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
  alive = true;
  timerUpdate;
  colliderPoint = [];
  
  constructor(id, game, pos) {
    this.id = id;
    this.game = game;
    this.pos = pos;
    this.posCanon = {x: 0, y: 0};

    this.speed = 300;
    this.speedRotation = 100;
    this.angleMove = 0;
    this.angle = 0;
    this.canonAngle = 0;
  }

  create() {
    this.container = this.game.add.container(this.pos.x, this.pos.y);
    this.sprite = this.game.add.sprite(0, 0, 'tank');
    this.game.group.add(this.sprite);
    this.sprite.entity = this;
    this.canon = this.game.add.sprite(0, 0, 'canon').setOrigin(0.15, 0.5);
    this.endcanon = this.game.add.sprite(this.pos.x + 50, this.pos.y, 'endcanon');

    for (var i = 0; i < 4; i++) {
        this.colliderPoint.push(new Phaser.Geom.Point(150, 150));
    }

    this.colliderPoint[3].offset = {
        x: -35,
        y: -25
    };
    this.colliderPoint[2].offset = {
        x: 35,
        y: -25
    };
    this.colliderPoint[0].offset = {
        x: -35,
        y: 25
    };
    this.colliderPoint[1].offset = {
        x: 35,
        y: 25
    };



    // this.colliderPoint[i]

    this.rect = new Phaser.Geom.Rectangle(0, 0, 100, 16);
    this.currentLife = new Phaser.Geom.Rectangle(0, 1, 100, 15);
    this.graphics = this.game.add.graphics({ lineStyle: { alpha: 1, width: 1, color: 0x0000ff }});
    this.graphics = this.game.add.graphics({ fillStyle: { color: 0x00ff00 }});


    this.container.add([this.sprite, this.canon]);

  }

  update() {
  }

  updateAfter() {
      this.graphics.clear();

      this.currentLife.x = this.pos.x - 50;
      this.currentLife.y = this.pos.y - 60;

      this.rect.x = this.pos.x - 50;
      this.rect.y = this.pos.y - 60;

      this.graphics.strokeRectShape(this.rect);

      this.currentLife.width = this.life * 100 / this.maxlife;
      this.graphics.fillRectShape(this.currentLife);

      for (var i = 0; i < 4; ++i) {
          var currentPos = {
              x: this.pos.x - this.colliderPoint[i].offset.x,
              y: this.pos.y - this.colliderPoint[i].offset.y
          };

          this.colliderPoint[i].x = (currentPos.x - this.pos.x) * Math.cos(degrees_to_radians(this.angle)) - (currentPos.y - this.pos.y) * Math.sin(degrees_to_radians(this.angle)) + this.pos.x;
          this.colliderPoint[i].y = (currentPos.y - this.pos.y) * Math.cos(degrees_to_radians(this.angle)) + (currentPos.x - this.pos.x) * Math.sin(degrees_to_radians(this.angle)) + this.pos.y;

          this.graphics.fillPointShape(this.colliderPoint[i], 5);
      }
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
