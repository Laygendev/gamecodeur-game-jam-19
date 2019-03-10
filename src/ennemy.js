class Ennemy extends Entity {
  constructor(id, room, game, pos) {
    super(id, room, game, pos);

    this.speed = 3;
    this.maxlife = 5;
    this.life = 5;
  }

  update() { }

  draw() {

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

    this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);
    this.game.ctx.restore();

    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y  - this.game.camera.y);
    this.game.ctx.rotate(this.canonAngle  * Math.PI / 180);

    this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
    this.game.ctx.restore();

    this.posLife.x = this.pos.x - this.game.camera.x - 50;
    this.posLife.y = this.pos.y - this.game.camera.y - 50;

    this.game.ctx.fillRect(this.posLife.x, this.posLife.y, 100, 10);
    this.game.ctx.save();
    this.game.ctx.fillStyle = "#556B2F";
    this.game.ctx.fillRect(this.posLife.x, this.posLife.y, this.life * 100 / this.maxlife, 10);
    this.game.ctx.restore();

    var posPseudo = {
      x: this.pos.x - this.game.camera.x,
      y: this.pos.y - this.game.camera.y - 50
    };

    this.game.ctx.font = "26px Arial";
    this.game.ctx.fillText(this.pseudo, posPseudo.x - this.game.ctx.measureText(this.pseudo).width / 2, posPseudo.y - 20);
  }
}
