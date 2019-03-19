class UI {
  constructor(game) {
    this.game     = game;
    this.entities = [];
  }

  add(entity) {
    entity.ui = this;
    this.entities[entity.id] = entity;
  }

  update(dt) {
    for (var key in this.entities) {
      this.entities[key].update(dt);
    }
  }

  draw() {
    for (var key in this.entities) {
      this.entities[key].draw(this.game);
    }
  }

  destroy(entityID) {
    delete this.entities[entityID]
  }

  displayDamage(data) {
    var text = new UIText(data.position, 10);
    this.add(text)
  }
}

class UIText {
  constructor(pos, text) {
    this.id       = +Date.now();
    this.text     = text;
    this.pos      = pos;
    this.alpha    = 1;
    this.angle    = 1;
    this.speed    = 100;
    this.velocity = { x: 0.2, y: -1 };

    this.createdTime = +Date.now();
    this.lastTime    = +Date.now();
    this.lifetime    = 1000;
    this.timeElapsed = 0;
  }

  update(dt) {
    this.lastTime = +Date.now();

    this.timeElapsed = this.lastTime - this.createdTime;

    this.pos[0] += dt * this.speed * this.velocity.x * Math.cos(this.angle);
    this.pos[1] += dt * this.speed * this.velocity.y * Math.sin(this.angle);

    if (this.timeElapsed >= this.lifetime) {
      this.ui.destroy(this.id);
    }
  }

  draw(game) {
    this.alpha = (this.lifetime - this.timeElapsed) / 1000 * 1;
    game.ctx.save();
    game.ctx.globalAlpha = this.alpha;
    game.ctx.fillStyle = "#eb2f06";
    game.ctx.fillText('-10', this.pos[0] - game.camera.x, this.pos[1] - game.camera.y);
    game.ctx.restore();
  }
}
