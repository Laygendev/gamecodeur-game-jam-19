class Player extends Entity {
  constructor(id, room, game, pos) {
    super(id, room, game, pos);

    this.reloadShootTime = 0.6;
    this.canShoot = true;
    this.canSpeed = true;

    this.maxlife = 5;
    this.life = this.maxlife;
  }

  event() {

  }

  update() {
    super.update();

    this.canonAngle = Math.atan2((this.game.input.mousePosition.y + this.game.camera.y ) - this.pos.y, (this.game.input.mousePosition.x + this.game.camera.x) - this.pos.x);

    if (this.game.input.leftClickPressed && this.canShoot && !this.isSpectator) {
      this.canShoot = false;
      this.shoot    = true;

      setTimeout(() => {
        this.canShoot = true;
      }, this.reloadShootTime * 1000);
    }

    if (this.game.input.keyPressed.space && this.canSpeed && !this.isSpectator) {
      this.canSpeed = false;

      this.goSpeed = true;

      setTimeout(() => {
        this.canSpeed = true;
      }, this.reloadShootTime * 5000);
    }
  }

  draw(dt) {
    var i = 1;
    for (var key in this.speedEffect) {

      this.game.ctx.save();

      this.game.ctx.translate(this.speedEffect[key].pos.x - this.game.camera.x, this.speedEffect[key].pos.y - this.game.camera.y);
      this.game.ctx.rotate(this.speedEffect[key].angle * Math.PI / 180);
      this.game.ctx.globalAlpha = i * 0.005;

      this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);

      this.game.ctx.restore();
      i++;
    }


    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y - this.game.camera.y);
    this.game.ctx.rotate(this.angle);

    if (this.isSpectator) {
      this.game.ctx.globalAlpha = 0.5;
    } else {
      this.game.ctx.globalAlpha = 1;
    }

    this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);
    this.game.ctx.restore();

     this.game.ctx.save();
     this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y  - this.game.camera.y);
     this.game.ctx.rotate(this.canonAngle * Math.PI / 180);

     if (this.isSpectator) {
       this.game.ctx.globalAlpha = 0.5;
     }

     this.game.ctx.drawImage(this.game.ressources['canon'], 20 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
     this.game.ctx.restore();

       if (!this.isSpectator) {
       this.posLife.x = this.pos.x - this.game.camera.x - 50;
       this.posLife.y = this.pos.y - this.game.camera.y - 50;

       this.game.ctx.fillRect(this.posLife.x, this.posLife.y, 100, 10);
       this.game.ctx.save();
       this.game.ctx.fillStyle = "#556B2F";
       this.game.ctx.fillRect(this.posLife.x, this.posLife.y, this.life * 100 / this.maxlife, 10);
       this.game.ctx.restore();
     }

     var posPseudo = {
       x: this.pos.x - this.game.camera.x,
       y: this.pos.y - this.game.camera.y - 50
     };

     this.game.ctx.font = "26px Arial";
     this.game.ctx.fillText(this.pseudo, posPseudo.x - this.game.ctx.measureText(this.pseudo).width / 2, posPseudo.y - 20);
  }
}
