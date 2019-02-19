class Player extends Entity {
  cursors;

  constructor(id, game, pos) {
    super(id, game, pos);
    this.maxlife = 5;
    this.life = this.maxlife;
  }

  create() {
    super.create();

    this.cursors = this.game.input.keyboard.createCursorKeys();

    //this.game.cameras.main.startFollow(this.container);

    this.game.input.on('pointerdown', (pointer) => {
      this.game.net.Shoot({
          id: this.id
      });
    });
    
    this.timerUpdate = this.game.time.addEvent({ delay: 5, callback: this.updatePos, callbackScope: this, loop: true });
  }
  
  updatePos() {
     var colliderPos = [];
     for (var i = 0; i < 4; ++i) {
         colliderPos.push({
             x: this.colliderPoint[i].x,
             y: this.colliderPoint[i].y
         });
     }
     
    this.game.net.updatePos({
        id: this.id,
        x: this.container.x,
        y: this.container.y,
        angle: this.angle,
        endcanonangle: this.endcanon.angle,
        endcanon: {
            x: this.endcanon.x,
            y: this.endcanon.y
        },
        canonAngle: radians_to_degrees(this.canonAngle),
        colliderPos: colliderPos
    });
  }

  update(delta) {
      super.update(delta);
      
     delta = this.game.game.loop.delta;

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
    
    super.updateAfter();
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
