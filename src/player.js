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

  updatePos() {
    this.game.net.updatePos({
        id: this.id,
        x: this.pos.x,
        y: this.pos.y,
        angle: this.angle,
        canonAngle: this.canonAngle,
        posCanon: {
            x: this.posCanon.x,
            y: this.posCanon.y
        },
        colliderPoint: this.colliderPoint
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


    this.canonAngle = Math.atan2((this.game.input.mousePosition.y + this.game.camera.y ) - this.pos.y, (this.game.input.mousePosition.x + this.game.camera.x) - this.pos.x);
    // this.canonAngle = Phaser.Math.Angle.Between(this.container.x, this.container.y, inputPos.x + this.game.cameras.main.scrollX, inputPos.y + this.game.cameras.main.scrollY);
    // let dt = Math.sqrt(Math.pow((this.game.input.mousePosition.x - this.game.camera.x - (this.pos.x + this.game.ressources['tank'].width / 2 + 30)), 2) + Math.pow((this.game.input.mousePosition.y - this.game.camera.y - (this.pos.y + this.game.ressources['tank'].height / 2 + 25)), 2 ));
    let dt = Math.sqrt(Math.pow(this.pos.x + this.game.camera.x + this.game.input.mousePosition.x, 2) + Math.pow(this.pos.y + this.game.camera.y + this.game.input.mousePosition.y, 2 ) );
    let t = 50 / dt;
    this.posCanon.x = (this.pos.x - this.game.camera.x + (this.pos.x - this.game.camera.x + (100 * Math.cos(this.canonAngle)))) * 0.5;
    this.posCanon.y = (this.pos.y - this.game.camera.y + (this.pos.y - this.game.camera.y + (100 * Math.sin(this.canonAngle)))) * 0.5;


    // //
    // // this.canon.angle = radians_to_degrees( this.canonAngle );
    // // this.endcanon.angle = radians_to_degrees( this.canonAngle );
    // this.draw();
    // super.updateAfter();
  }

  draw() {
      super.draw();
  }

  destroy() {
    this.game.input.off('pointerdown');

    super.destroy();
  }
}
