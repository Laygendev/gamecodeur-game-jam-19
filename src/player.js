class Player extends Entity {
  cursors;

  constructor(id, game, pos) {
    super(id, game, pos);

    this.life = 5;
  }

  create() {
    super.create();

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.cameras.main.startFollow(this.container);

    this.game.input.on('pointerdown', (pointer) => {
      let sprite = this.game.physics.add.sprite(this.endcanon.x, this.endcanon.y, 'fire');
      sprite.angle = this.endcanon.angle;
      var bullet = {
        'basePos': JSON.parse(JSON.stringify(this.endcanon)),
        'sprite': sprite,
        'speed': 15,
        'distanceMax': 300,
        'angleRadians': degrees_to_radians(sprite.angle),
        'pos': JSON.parse(JSON.stringify(this.endcanon))
      };

      this.game.physics.add.overlap(this.game.group, sprite, (tank, bullet) => test(this, tank, bullet, () => {

      }));
      this.bullets.push(bullet);
    });
  }

  update(delta) {
     delta = this.game.game.loop.delta;
    for (var key in this.bullets) {
      this.bullets[key].pos.x += this.bullets[key].speed * Math.cos(this.bullets[key].angleRadians);
      this.bullets[key].pos.y += this.bullets[key].speed * Math.sin(this.bullets[key].angleRadians);

      this.bullets[key].sprite.x = this.bullets[key].pos.x;
      this.bullets[key].sprite.y = this.bullets[key].pos.y;

      if (Phaser.Math.Distance.Between(this.bullets[key].basePos.x, this.bullets[key].basePos.y, this.bullets[key].pos.x, this.bullets[key].pos.y) >= this.bullets[key].distanceMax) {
        this.particles.emitParticleAt(this.bullets[key].pos.x, this.bullets[key].pos.y);
        this.bullets[key].sprite.destroy();
        this.bullets.splice(key, 1);
      }
    }

    this.angleMove = degrees_to_radians(this.angle);

    if (this.cursors.left.isDown) {
      this.angle -= this.speedRotation * delta;
    }
    if (this.cursors.right.isDown) {
      this.angle += this.speedRotation * delta;
    }

    if (this.cursors.up.isDown) {
      this.pos.x += this.speed * Math.cos(this.angleMove) * delta;
      this.pos.y += this.speed * Math.sin(this.angleMove) * delta;
    }

    this.container.x = this.pos.x;
    this.container.y = this.pos.y;

    this.sprite.angle = this.angle;

    let inputPos = this.game.input.activePointer.position;
    this.canonAngle = Phaser.Math.Angle.Between(this.container.x, this.container.y, inputPos.x + this.game.cameras.main.scrollX, inputPos.y + this.game.cameras.main.scrollY);
    let dt = Math.sqrt(Math.pow(((inputPos.x + this.game.cameras.main.scrollX) - this.container.x), 2) + Math.pow(((inputPos.y + this.game.cameras.main.scrollY) - this.container.y), 2 ));
    let t = 50 / dt;
    this.endcanon.x = (1 - t) * this.container.x + t * (inputPos.x + this.game.cameras.main.scrollX);
    this.endcanon.y = (1 - t) * this.container.y + t * (inputPos.y + this.game.cameras.main.scrollY);

    this.canon.angle = radians_to_degrees( this.canonAngle );
    this.endcanon.angle = radians_to_degrees( this.canonAngle );
  }

  destroy() {
    this.game.input.off('pointerdown');

    super.destroy();
  }
}


function test(player, tank, bullet, cb) {
  for (var key in player.bullets) {
    if ( player.bullets.indexOf(bullet)) {
      player.particles.emitParticleAt(player.bullets[key].pos.x, player.bullets[key].pos.y);
      player.bullets[key].sprite.destroy();
      player.bullets.splice(key, 1);
    }
  }

  tank.entity.life--;


  if (tank.entity.life <= 0 ) {
    player.game.tanksToDestroy.push(tank.entity)
    cb();
  }
}
