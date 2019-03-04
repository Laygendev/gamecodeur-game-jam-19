class Player extends Entity {
  constructor(id, room, game, pos) {
    super(id, room, game, pos);

    this.reloadShootTime = 0.2;
    this.canShoot = true;

    this.maxlife = 5;
    this.life = this.maxlife;
  }

  event() {

  }

  update() {
    super.update();

    this.canonAngle = Math.atan2((this.game.input.mousePosition.y + this.game.camera.y ) - this.pos.y, (this.game.input.mousePosition.x + this.game.camera.x) - this.pos.x);

    let dt = Math.sqrt(Math.pow(this.pos.x + this.game.camera.x + this.game.input.mousePosition.x, 2) + Math.pow(this.pos.y + this.game.camera.y + this.game.input.mousePosition.y, 2 ) );
    let t = 50 / dt;
    this.posCanon.x = (this.pos.x - this.game.camera.x + (this.pos.x - this.game.camera.x + (100 * Math.cos(this.canonAngle)))) * 0.5;
    this.posCanon.y = (this.pos.y - this.game.camera.y + (this.pos.y - this.game.camera.y + (100 * Math.sin(this.canonAngle)))) * 0.5;

    this.posCanonServer.x = (this.pos.x + (this.pos.x + (100 * Math.cos(this.canonAngle)))) * 0.5;
    this.posCanonServer.y = (this.pos.y + (this.pos.y + (100 * Math.sin(this.canonAngle)))) * 0.5;


    if (this.game.input.leftClickPressed && this.canShoot && !this.isSpectator) {
      this.canShoot = false;

      this.shoot = true;

      setTimeout(() => {
        this.canShoot = true;
      }, this.reloadShootTime * 1000);
    }
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
     this.game.ctx.rotate(Utils.radiansToDegrees(this.canonAngle) * Math.PI / 180);

     if (this.isSpectator) {
       this.game.ctx.globalAlpha = 0.5;
     }

     this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
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
