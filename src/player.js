class Player extends Entity {
  reloadShootTime;
  canShoot;

  constructor(id, game, pos) {
    super(id, game, pos);

    this.reloadShootTime = 0.2;
    this.canShoot = true;
    this.maxlife = 5;
    this.life = this.maxlife;

    setInterval(() => { this.updatePos() }, 5);
  }

  create() {
    // super.create();
    //
    // this.cursors = this.game.input.keyboard.createCursorKeys();
    //
    // this.game.cameras.main.startFollow(this.container);
    //
    // this.game.input.on('pointerdown', (pointer) => {
    //   this.game.net.Shoot({
    //       id: this.id
    //   });
    // });
    //
    // this.timerUpdate = this.game.time.addEvent({ delay: 5, callback: this.updatePos, callbackScope: this, loop: true });
  }

  updatePos() {
     // var colliderPos = [];
     // for (var i = 0; i < 4; ++i) {
     //     colliderPos.push({
     //         x: this.colliderPoint[i].x,
     //         y: this.colliderPoint[i].y
     //     });
     // }

    this.game.net.updatePos({
        id: this.id,
        x: this.pos.x,
        y: this.pos.y,
        angle: this.angle,
        canonAngle: this.canonAngle,
        posCanon: {
            x: this.posCanon.x,
            y: this.posCanon.y
        }
    });
  }

  event() {
    if (this.game.input.leftClickPressed && this.canShoot) {
      this.canShoot = false;

      this.game.net.Shoot({
        id: this.id,
      });

      setTimeout(() => {
        this.canShoot = true;
      }, this.reloadShootTime * 1000);
    }
  }

  update(delta) {
      this.event();

      super.update(delta);

      this.angleMove = degrees_to_radians(this.angle);

        if (this.game.input.keyPressed.left) {
          this.angle -= this.speedRotation * delta;
        }
        if (this.game.input.keyPressed.right) {
          this.angle += this.speedRotation * delta;
        }

    if (this.game.input.keyPressed.up) {
      this.pos.x += this.speed * Math.cos(this.angleMove) * delta;
      this.pos.y += this.speed * Math.sin(this.angleMove) * delta;
    }

    this.canonAngle = Math.atan2(this.game.input.mousePosition.y - this.pos.y - this.game.ressources['canon'].height, this.game.input.mousePosition.x - this.pos.x - this.game.ressources['canon'].width);
    // this.canonAngle = Phaser.Math.Angle.Between(this.container.x, this.container.y, inputPos.x + this.game.cameras.main.scrollX, inputPos.y + this.game.cameras.main.scrollY);
    let dt = Math.sqrt(Math.pow((this.game.input.mousePosition.x - (this.pos.x + this.game.ressources['tank'].width / 2 + 30)), 2) + Math.pow((this.game.input.mousePosition.y - (this.pos.y + this.game.ressources['tank'].height / 2 + 25)), 2 ));
    let t = 50 / dt;
    this.posCanon.x = (1 - t) * (this.pos.x + this.game.ressources['tank'].width / 2 + 30) + t * (this.game.input.mousePosition.x);
    this.posCanon.y = (1 - t) * (this.pos.y + this.game.ressources['tank'].height / 2 + 25) + t * (this.game.input.mousePosition.y);
    //
    // this.canon.angle = radians_to_degrees( this.canonAngle );
    // this.endcanon.angle = radians_to_degrees( this.canonAngle );
    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x + this.game.ressources['tank'].width, this.pos.y + this.game.ressources['tank'].height);
    this.game.ctx.rotate(this.angle * Math.PI / 180);

    this.game.ctx.drawImage(this.game.ressources['tank'], -this.game.ressources['tank'].width / 2, -this.game.ressources['tank'].height / 2);
     this.game.ctx.restore();

     this.game.ctx.save();
     this.game.ctx.translate(this.pos.x + this.game.ressources['canon'].width, this.pos.y + this.game.ressources['canon'].height);
     this.game.ctx.rotate(radians_to_degrees(this.canonAngle) * Math.PI / 180);

     this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
     this.game.ctx.restore();

    // super.updateAfter();
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
