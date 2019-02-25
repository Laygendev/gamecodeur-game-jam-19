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
        posCanonServer: this.posCanonServer,
        colliderPointServer: this.colliderPointServer,
        isSpectator: this.isSpectator
    });
  }

  event() {
    if (this.game.input.leftClickPressed && this.canShoot && !this.isSpectator) {
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

    let dt = Math.sqrt(Math.pow(this.pos.x + this.game.camera.x + this.game.input.mousePosition.x, 2) + Math.pow(this.pos.y + this.game.camera.y + this.game.input.mousePosition.y, 2 ) );
    let t = 50 / dt;
    this.posCanon.x = (this.pos.x - this.game.camera.x + (this.pos.x - this.game.camera.x + (100 * Math.cos(this.canonAngle)))) * 0.5;
    this.posCanon.y = (this.pos.y - this.game.camera.y + (this.pos.y - this.game.camera.y + (100 * Math.sin(this.canonAngle)))) * 0.5;

    this.posCanonServer.x = (this.pos.x + (this.pos.x + (100 * Math.cos(this.canonAngle)))) * 0.5;
    this.posCanonServer.y = (this.pos.y + (this.pos.y + (100 * Math.sin(this.canonAngle)))) * 0.5;
  }

  draw() {
    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y - this.game.camera.y);
    this.game.ctx.rotate(this.angle * Math.PI / 180);

    if (this.isSpectator) {
      this.game.ctx.globalAlpha = 0.5;
    }

    this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);
    this.game.ctx.restore();

     this.game.ctx.save();
     this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y  - this.game.camera.y);
     this.game.ctx.rotate(radians_to_degrees(this.canonAngle) * Math.PI / 180);

     if (this.isSpectator) {
       this.game.ctx.globalAlpha = 0.5;
     }

     this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
     this.game.ctx.restore();

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

       if (!this.isSpectator) {
         this.posLife.x = this.pos.x - this.game.camera.x - 50;
         this.posLife.y = this.pos.y - this.game.camera.y - 50;

         this.game.ctx.fillRect(this.posLife.x, this.posLife.y, 100, 10);
         this.game.ctx.save();
         this.game.ctx.fillStyle = "#556B2F";
         this.game.ctx.fillRect(this.posLife.x, this.posLife.y, this.life * 100 / this.maxlife, 10);
         this.game.ctx.restore();
       }
  }

  destroy() {
  }
}
