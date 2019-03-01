class Game {
    started;
    
    canvas;
    ctx;

    dt;
    lastframetime;
    updateid;

    loader;
    net;
    input;
    camera;

    ressources;
    tanks;
    bullets;

    width;
    height;

    constructor() {
        this.started = false;
        this.canvas  = document.getElementById('canvas');
        this.ctx     = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ressources = [];
        this.tanks      = [];
        this.bullets    = [];

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

        this.gameLoop(new Date().getTime());
    }
    
    stop() {
        this.started = false;
        for (var key in this.tanks) {
            this.tanks[key].destroy();
        }
        
        this.tanks   = [];
        this.bullets = [];
        this.net.reset();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }


  gameLoop(t) {
    if (this.started) {
        this.update(t);
        this.draw();

        this.updateid = window.requestAnimationFrame(this.gameLoop.bind(this), this.viewport);
    }
  }

  update(t) {
    if (this.net.init) {
      this.dt = this.lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;
      this.lastframetime = t;

      for (var key in this.bullets) {
          this.bullets[key].pos.x += this.bullets[key].speed * this.dt * Math.cos(this.bullets[key].angleRadians);
          this.bullets[key].pos.y += this.bullets[key].speed * this.dt * Math.sin(this.bullets[key].angleRadians);
      }

      for (var key in this.tanks) {
        this.tanks[key].update(this.dt);
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
  }

}



var frame_time = 60/1000; // run the local game at 16ms/ 60hz

if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz

( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );


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

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
