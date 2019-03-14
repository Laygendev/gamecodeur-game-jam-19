class Game {
  constructor() {
    this.started = false;
    this.canvas  = document.getElementById('canvas');
    this.ctx     = this.canvas.getContext('2d');

    this.t       = 0;
    this.last_ts = 0;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ressources = [];
    this.tanks      = [];
    this.bullets    = [];

    this.input  = undefined;
    this.camera = undefined;
    this.htmlUI = undefined;
    this.ui     = undefined;
    this.net    = undefined;
    this.world  = undefined;

    this.loader = new Loader(this);
    this.loader.loadImage('tile', 'asset/tile.png');
    this.loader.loadImage('tank', 'asset/tank.png');
    this.loader.loadImage('canon', 'asset/canon.png');
    this.loader.loadImage('fire', 'asset/fire.png');
    this.loader.loadImage('endcanon', 'asset/endcanon.png');
    this.loader.loadImage('ile', 'asset/ile.png');
    this.loader.loadJSON('worldCollider', 'asset/worldCollider.json');

    this.loader.start();

    this.htmlUI = new htmlUI(this);
  }

  start() {
    this.started = true;
    this.input   = new Input(this);
    this.camera  = new Camera(this);
    this.ui      = new UI(this);
    this.world   = new World(this);

    requestAnimationFrame(() => { this.gameLoop(); });
  }

  stop() {
    this.started = false;
    this.tanks   = [];
    this.bullets = [];
    this.net.reset();
    this.htmlUI.reset();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }


  gameLoop() {
    if (this.started) {
      var now_ts = +new Date();
      var last_ts = this.last_ts || now_ts;
      var dt_sec = (now_ts - last_ts) / 1000.0;
      this.last_ts = now_ts;

      this.net.update(dt_sec);
      this.update(dt_sec);
      this.draw(dt_sec);

    }

    requestAnimationFrame(() => { this.gameLoop(); });

  }

  update(dt) {
    if (this.net.init) {

      for (var key in this.bullets) {
          this.bullets[key].update(dt);
      }

      this.ui.update(dt);
      this.camera.update();
    }
  }

  draw(dt) {
    if (this.net.init) {
      var tile = 0;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (var x = 0; x < this.width; x += 40) {
        for (var y = 0; y < this.height; y += 40) {
          if (this.camera.inViewport(x, y)) {
            this.ctx.drawImage(this.ressources['tile'], x - this.camera.x, y - this.camera.y);
            tile++;
          }
        }
      }

      this.ctx.drawImage(this.ressources['ile'], 2000 - this.camera.x, 2000 - this.camera.y );

      this.world.draw();

      for (var key in this.tanks) {
        this.tanks[key].draw(dt);

        if (this.tanks[key] instanceof Player) {
          this.ctx.save();
          this.ctx.font = "20px Arial";
          this.ctx.fillText('X: ' + parseInt(this.tanks[key].pos.x) + ' Y: ' + parseInt(this.tanks[key].pos.y), 20, 40);
          this.ctx.restore();
        }
      }


      for (var key in this.bullets) {
        this.bullets[key].draw(dt);
      }
    }

    this.ui.draw();

    this.ctx.font = "20px Arial";
    this.ctx.fillText(this.net.latency + 'ms', 20, 20);
  }

}


function sqr(a) {
  return a*a;
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
