class Ennemy extends Entity {
  constructor(id, game, pos) {
    super(id, game, pos);

    this.speed = 3;
    this.maxlife = 5;
    this.life = 5;
  }

  update() { }

  draw() {
    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y - this.game.camera.y);
    this.game.ctx.rotate(this.angle * Math.PI / 180);

    this.game.ctx.drawImage(this.game.ressources['tank'], -this.width / 2, -this.height / 2);
    this.game.ctx.restore();

    this.game.ctx.save();
    this.game.ctx.translate(this.pos.x - this.game.camera.x, this.pos.y  - this.game.camera.y);
    this.game.ctx.rotate(radians_to_degrees(this.canonAngle) * Math.PI / 180);

    this.game.ctx.drawImage(this.game.ressources['canon'], 16 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2);
    this.game.ctx.restore();

    this.posLife.x = this.pos.x - this.game.camera.x - 50;
    this.posLife.y = this.pos.y - this.game.camera.y - 50;

    this.game.ctx.fillRect(this.posLife.x, this.posLife.y, 100, 10);
    this.game.ctx.save();
    this.game.ctx.fillStyle = "#556B2F";
    this.game.ctx.fillRect(this.posLife.x, this.posLife.y, this.life * 100 / this.maxlife, 10);
    this.game.ctx.restore();
  }
}
