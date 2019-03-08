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

    requestAnimationFrame(() => {this.gameLoop()});
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

        this.update(dt_sec);
        this.net.update(dt_sec);
        this.draw(dt_sec);

        requestAnimationFrame(() => {this.gameLoop()});
    }
  }

  update(dt) {
    if (this.net.init) {

      for (var key in this.bullets) {
          this.bullets[key].pos.x += this.bullets[key].speed * dt * Math.cos(this.bullets[key].angleRadians);
          this.bullets[key].pos.y += this.bullets[key].speed * dt * Math.sin(this.bullets[key].angleRadians);
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

      for (var key in this.tanks) {
        this.tanks[key].draw();

        if (this.tanks[key] instanceof Player) {
          this.ctx.save();
          this.ctx.font = "20px Arial";
          this.ctx.fillText('X: ' + parseInt(this.tanks[key].pos.x) + ' Y: ' + parseInt(this.tanks[key].pos.y), 20, 40);
          this.ctx.restore();
        }
        // if (typeof this.tanks[key])
      }


      for (var key in this.bullets) {

        var distance = Math.sqrt(sqr(this.tanks[this.bullets[key].id].pos.y - this.bullets[key].pos.y) + sqr(this.tanks[this.bullets[key].id].pos.x - this.bullets[key].pos.x));

        if (distance > 200) {
          for (var i = 0; i < 500; i++) {
            this.ctx.save();

            var copy = {
              x: this.bullets[key].pos.x,
              y: this.bullets[key].pos.y
            };

            copy.x -= i * 200 * dt * Math.cos(this.bullets[key].angleRadians);
            copy.y -= i * 200 * dt * Math.sin(this.bullets[key].angleRadians);

            this.ctx.translate(copy.x - this.camera.x + this.ressources['fire'].width, copy.y - this.camera.y + this.ressources['fire'].height);
            this.ctx.rotate(this.bullets[key].angleRadians);
            this.ctx.globalAlpha = (1 / i);

            this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
            this.ctx.restore();
          }
        }

        this.ctx.save();

        this.ctx.translate(this.bullets[key].pos.x - this.camera.x + this.ressources['fire'].width, this.bullets[key].pos.y - this.camera.y + this.ressources['fire'].height);
        this.ctx.rotate(this.bullets[key].angleRadians);

        this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
        this.ctx.restore();
      }
    }

    this.ui.draw();

    this.ctx.font = "20px Arial";
    this.ctx.fillText(this.net.latency + 'ms', 20, 20);
  }

}


if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

            return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                    window.setTimeout( callback, 1000 / 60 );

            };

    } )();

}

function sqr(a) {
  return a*a;
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
