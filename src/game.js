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

        this.input = undefined;
        this.camera = undefined;
        this.ui = undefined;
        this.net = undefined;

        this.loader = new Loader(this);
        this.loader.load('tile', 'asset/tile.png');
        this.loader.load('tank', 'asset/tank.png');
        this.loader.load('canon', 'asset/canon.png');
        this.loader.load('fire', 'asset/fire.png');
        this.loader.load('endcanon', 'asset/endcanon.png');

        this.loader.start();
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
        this.draw();

        requestAnimationFrame(() => {this.gameLoop()});
    }
  }

  update(dt) {
    if (this.net.init) {

      for (var key in this.bullets) {
          this.bullets[key].pos.x += this.bullets[key].speed * dt * Math.cos(this.bullets[key].angleRadians);
          this.bullets[key].pos.y += this.bullets[key].speed * dt * Math.sin(this.bullets[key].angleRadians);
      }

      this.camera.update();
    }
  }

  draw() {
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

      for (var key in this.tanks) {
        this.tanks[key].draw();
      }


      for (var key in this.bullets) {
        this.ctx.save();
        this.ctx.translate(this.bullets[key].pos.x - this.camera.x + this.ressources['fire'].width, this.bullets[key].pos.y - this.camera.y + this.ressources['fire'].height);
        this.ctx.rotate(this.bullets[key].angle * Math.PI / 180);

        this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
        this.ctx.restore();
      }
    }

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


function destroyTanks(game) {
  for (var key in game.tanksToDestroy) {
    game.tanksToDestroy[key].destroy();
    for (var other in game.tanks) {
      if(game.tanks[other].id == game.tanksToDestroy[key].id) {
        game.tanks.splice(other, 1);
      }
    }

    game.tanksToDestroy.splice(key, 1);
    game.scoreText.setText('Total Tanks: ' + game.tanks.length);
  }
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
