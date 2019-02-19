class Ennemy extends Entity {
  target = undefined;
  haveRangeToHit = false;
  reloadTime = 500;
  canHit = true;
  timer;

  constructor(id, game, pos) {
    super(id, game, pos);

    this.speed = 3;
    this.maxlife = 5;
    this.life = 5;
  }

  create() {
    super.create();

    // this.timer = this.game.time.addEvent({ delay: this.reloadTime, callback: this.updateFire, callbackScope: this, loop: true });
    // this.timer.paused = true;
  }

  updateFire() {
    this.canHit = true;
    this.timer.paused = true;
  }

  update() {
      super.update();
      this.updateAfter();
    // this.findTarget();
    // this.moveTo();
    // this.hit();
    //
    // for (var key in this.bullets) {
    //   this.bullets[key].pos.x += this.bullets[key].speed * Math.cos(this.bullets[key].angleRadians);
    //   this.bullets[key].pos.y += this.bullets[key].speed * Math.sin(this.bullets[key].angleRadians);
    //
    //   this.bullets[key].sprite.x = this.bullets[key].pos.x;
    //   this.bullets[key].sprite.y = this.bullets[key].pos.y;
    //
    //   if (Phaser.Math.Distance.Between(this.bullets[key].basePos.x, this.bullets[key].basePos.y, this.bullets[key].pos.x, this.bullets[key].pos.y) >= this.bullets[key].distanceMax) {
    //     this.particles.emitParticleAt(this.bullets[key].pos.x, this.bullets[key].pos.y);
    //     this.bullets[key].sprite.destroy();
    //     this.bullets.splice(key, 1);
    //   }
    // }
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
          // var currentPos = {
          //     x: this.pos.x - this.colliderPoint[i].offset.x,
          //     y: this.pos.y - this.colliderPoint[i].offset.y
          // };
          // 
          // this.colliderPoint[i].x = (currentPos.x - this.pos.x) * Math.cos(degrees_to_radians(this.angle)) - (currentPos.y - this.pos.y) * Math.sin(degrees_to_radians(this.angle)) + this.pos.x;
          // this.colliderPoint[i].y = (currentPos.y - this.pos.y) * Math.cos(degrees_to_radians(this.angle)) + (currentPos.x - this.pos.x) * Math.sin(degrees_to_radians(this.angle)) + this.pos.y;
          // 
          this.graphics.fillPointShape(this.colliderPoint[i], 5);
      }
  }

  findTarget() {
    var targetD = 9999;
    if (this.target == undefined && this.game.tanks.length > 1) {
      for (var key in this.game.tanks) {
        if (this.game.tanks[key].id != this.id) {
          if (Phaser.Math.Distance.Between(this.pos.x, this.pos.y, this.game.tanks[key].pos.x, this.game.tanks[key].pos.y) < targetD) {
            this.target = this.game.tanks[key];
            targetD = Phaser.Math.Distance.Between(this.pos.x, this.pos.y, this.game.tanks[key].pos.x, this.game.tanks[key].pos.y);
          }
        }
      }
    }
  }

  moveTo() {
    if (this.target && this.target.alive) {
      this.angleMove = this.angle;
      this.angle = Phaser.Math.Angle.Between(this.container.x, this.container.y, this.target.pos.x, this.target.pos.y);

      this.sprite.angle = radians_to_degrees(this.angle);

      if ( ! this.haveRangeToHit ) {
        this.pos.x += this.speed * Math.cos(this.angleMove);
        this.pos.y += this.speed * Math.sin(this.angleMove);

        this.container.x = this.pos.x;
        this.container.y = this.pos.y;

        let dt = Math.sqrt(Math.pow((this.target.pos.x - this.pos.x), 2) + Math.pow((this.target.pos.y - this.pos.y), 2 ));
        let t = 50 / dt;
        this.endcanon.x = (1 - t) * this.pos.x + t * this.target.pos.x;
        this.endcanon.y = (1 - t) * this.pos.y + t * this.target.pos.y;
      }

      //   let dt = Math.sqrt(Math.pow(((inputPos.x + this.game.cameras.main.scrollX) - this.container.x), 2) + Math.pow(((inputPos.y + this.game.cameras.main.scrollY) - this.container.y), 2 ));
      //   let t = 50 / dt;
      //   this.endcanon.x = (1 - t) * this.container.x + t * (inputPos.x + this.game.cameras.main.scrollX);
      //   this.endcanon.y = (1 - t) * this.container.y + t * (inputPos.y + this.game.cameras.main.scrollY);



      this.canon.angle = radians_to_degrees( this.angle );
      this.endcanon.angle = radians_to_degrees( this.angle );

      if (Phaser.Math.Distance.Between(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y) < 200) {
        this.haveRangeToHit = true;
      } else {
        this.haveRangeToHit = false;
      }
    } else {
      this.target = undefined;
    }
  }

  hit() {
    if (this.haveRangeToHit && this.canHit) {
      this.canHit = false;
      this.timer.paused = false;
      let sprite = this.game.physics.add.sprite(this.endcanon.x, this.endcanon.y, 'fire');
      sprite.angle = this.endcanon.angle;
      var bullet = {
        'basePos': JSON.parse(JSON.stringify(this.endcanon)),
        'sprite': sprite,
        'speed': 10,
        'distanceMax': 200,
        'angleRadians': degrees_to_radians(sprite.angle),
        'pos': JSON.parse(JSON.stringify(this.endcanon))
      };

      this.game.physics.add.overlap(this.game.group, sprite, (tank, bullet) => test(this, tank, bullet, () => {
        this.target = undefined;
        this.haveRangeToHit = false;
      }));
      this.bullets.push(bullet);
    }
  }
}
