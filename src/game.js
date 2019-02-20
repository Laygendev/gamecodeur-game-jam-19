class Game {
    canvas;
    ctx;
    
    dt;
    lastframetime;
    updateid;
    
    loader;
    net;
    input;
    
    ressources;
    tanks;
    
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx    = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.ressources = [];
        this.tanks      = [];
        
        this.loader = new Loader(this);
        this.loader.load('tile', 'asset/tile.png');
        this.loader.load('tank', 'asset/tank.png');
        this.loader.load('canon', 'asset/canon.png');
        this.loader.load('endcanon', 'asset/endcanon.png');
        this.loader.start();
    }

    start() {
        this.net   = new Net(this);
        this.input = new Input(this);
        
        this.update(new Date().getTime());
    }
  preload() {
    
    // this.load.image('fire', 'asset/fire.png');
    // this.load.image('tank', 'asset/tank.png');
    // this.load.image('canon', 'asset/canon.png');
    // this.load.image('endcanon', 'asset/endcanon.png');
    // 
    // this.load.atlas('explosion', 'asset/particles.png', 'asset/explosion.json');
    // 
    // this.tanks = [];
    // this.bullets = [];
    // this.tanksToDestroy = [];
    // this.group = this.add.group();

  }

  create() {
    // var width = winW;
    // var height = winH;
    // 
    // this.cameras.main.setBounds(0, 0, width*4, height*4);
    // 
    // var background = this.add.tileSprite(0, 0, width*8, height*8, 'background');
    // 
    // this.scoreText = this.add.text(16, 16, 'Total Tanks: ' + this.tanks.length, { fontSize: '32px', fill: '#000' });
    // this.scoreText.setScrollFactor(0);
    // 
    // this.net = new Net(this);
    // 
    // this.particles = this.add.particles('explosion');
    // this.particleDestroy = this.add.particles('canon');
    // this.particleDestroy2 = this.add.particles('tank');
    // 
    // this.particles.createEmitter({
    //     frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
    //     angle: { min: 240, max: 300 },
    //     speed: { min: 50, max: 100 },
    //     quantity: 6,
    //     lifespan: 2000,
    //     alpha: { start: 0.5, end: 0 },
    //     scale: { start: 1, end: 0.4 },
    //     on: false
    // });
    // 
    // this.particles.createEmitter({
    //     frame: 'muzzleflash2',
    //     lifespan: 200,
    //     scale: { start: 1, end: 0 },
    //     rotate: { start: 0, end: 180 },
    //     on: false
    // });
    // 
    // this.particleDestroy.createEmitter({
    //   lifespan: 500,
    //   angle: { min: 0, max: 360 },
    //   speed: { min: 1000, max: 1500 },
    //   rotate: { start: 0, end: 360 },
    //   on: false
    // });
    // 
    // this.particleDestroy2.createEmitter({
    //     angle: { min: 0, max: 300 },
    //     speed: { min: 1000, max: 1500 },
    //     quantity: 30,
    //     lifespan: 2000,
    //     scale: { start: 0.2, end: 0.1 },
    //     rotate: { start: 0, end: 360 },
    //     on: false
    // });

  }

  update(t) {
      this.dt = this.lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;
      this.lastframetime = t;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (var x = 0; x < this.canvas.width; x += 40) {
          for (var y = 0; y < this.canvas.width; y += 40) {
              this.ctx.drawImage(this.ressources['tile'], x, y);
          }
      }
      
    // destroyTanks(this);
    // 
    // for (var key in this.bullets) {
    //     this.bullets[key].pos.x += this.bullets[key].speed * Math.cos(this.bullets[key].angleRadians);
    //     this.bullets[key].pos.y += this.bullets[key].speed * Math.sin(this.bullets[key].angleRadians);
    // 
    //     this.bullets[key].sprite.x = this.bullets[key].pos.x;
    //     this.bullets[key].sprite.y = this.bullets[key].pos.y;
    // }
    // 
    for (var key in this.tanks) {
      this.tanks[key].update(this.dt);
    }
    
    this.updateid = window.requestAnimationFrame( this.update.bind(this), this.viewport );
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
