class Entity {
  id;
  container;
  sprite;
  game;
  pos;
  angle;
  speed;
  speedRotation;
  bullets = [];
  particles;
  particleDestroy;
  particleDestroy2;
  target;
  life;
  alive = true;
  timerUpdate;
  constructor(id, game, pos) {
    this.id = id;
    this.game = game;
    this.pos = pos;

    this.speed = 0.5;
    this.speedRotation = 0.1;
    this.angleMove = 0;
    this.angle = 0;
    this.canonAngle = 0;
  }

  create() {
    this.container = this.game.add.container(this.pos.x, this.pos.y);
    this.sprite = this.game.physics.add.sprite(0, 0, 'tank');
    this.game.group.add(this.sprite);
    this.sprite.entity = this;
    this.canon = this.game.add.sprite(0, 0, 'canon').setOrigin(0.15, 0.5);
    this.endcanon = this.game.add.sprite(this.pos.x + 50, this.pos.y, 'endcanon');

    this.container.add([this.sprite, this.canon]);

    this.particles = this.game.add.particles('explosion');
    this.particleDestroy = this.game.add.particles('canon');
    this.particleDestroy2 = this.game.add.particles('tank');

    this.particles.createEmitter({
        frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
        angle: { min: 240, max: 300 },
        speed: { min: 50, max: 100 },
        quantity: 6,
        lifespan: 2000,
        alpha: { start: 0.5, end: 0 },
        scale: { start: 1, end: 0.4 },
        on: false
    });

    this.particles.createEmitter({
        frame: 'muzzleflash2',
        lifespan: 200,
        scale: { start: 1, end: 0 },
        rotate: { start: 0, end: 180 },
        on: false
    });

    this.particleDestroy.createEmitter({
      lifespan: 500,
      angle: { min: 0, max: 360 },
      speed: { min: 1000, max: 1500 },
      rotate: { start: 0, end: 360 },
      on: false
    });

    this.particleDestroy2.createEmitter({
        angle: { min: 0, max: 300 },
        speed: { min: 1000, max: 1500 },
        quantity: 30,
        lifespan: 2000,
        scale: { start: 0.2, end: 0.1 },
        rotate: { start: 0, end: 360 },
        on: false
    });

    this.timerUpdate = this.game.time.addEvent({ delay: 5, callback: this.updatePos, callbackScope: this, loop: true });
  }

  updatePos() {
    this.game.net.updatePos({
        id: this.id,
        x: this.container.x,
        y: this.container.y,
        angle: this.angle,
        canonAngle: radians_to_degrees(this.canonAngle)
    });
  }

  destroy() {
    this.particleDestroy.emitParticleAt(this.pos.x, this.pos.y);
    this.particleDestroy2.emitParticleAt(this.pos.x, this.pos.y);
    this.container.destroy();
    this.endcanon.destroy();

    for(var key in this.bullets) {
      this.bullets[key].sprite.destroy();
      this.bullets.splice(key, 1);
    }
  }
}
