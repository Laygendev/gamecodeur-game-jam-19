var tank2;

class Game {

  preload() {
    this.load.image('background', 'asset/tile.png');
    this.load.image('fire', 'asset/fire.png');
    this.load.image('tank', 'asset/tank.png');
    this.load.image('canon', 'asset/canon.png');
    this.load.image('endcanon', 'asset/endcanon.png');

    this.load.atlas('explosion', 'asset/particles.png', 'asset/explosion.json');

    this.tanks = [];
    this.bullets = [];
    this.tanksToDestroy = [];
    this.group = this.add.group();

  }

  create() {
    var width = winW;
    var height = winH;

    // this.cameras.main.setBounds(0, 0, width*4, height*4);

    var background = this.add.tileSprite(0, 0, width*8, height*8, 'background');

    this.scoreText = this.add.text(16, 16, 'Total Tanks: ' + this.tanks.length, { fontSize: '32px', fill: '#000' });
    this.scoreText.setScrollFactor(0);

    this.net = new Net(this);
    
    this.particles = this.add.particles('explosion');
    this.particleDestroy = this.add.particles('canon');
    this.particleDestroy2 = this.add.particles('tank');

    this.particles.createEmitter({
        frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
        angle: { min: 240, max: 300 },
        speed: { min: 50, max: 100 },
        quantity: 6,
        lifespan: 2000,
        alpha: { start: 0.5, end: 0 },
        scale: { start: 1, end: 0.4 },
        on: false
    });

    this.particles.createEmitter({
        frame: 'muzzleflash2',
        lifespan: 200,
        scale: { start: 1, end: 0 },
        rotate: { start: 0, end: 180 },
        on: false
    });

    this.particleDestroy.createEmitter({
      lifespan: 500,
      angle: { min: 0, max: 360 },
      speed: { min: 1000, max: 1500 },
      rotate: { start: 0, end: 360 },
      on: false
    });

    this.particleDestroy2.createEmitter({
        angle: { min: 0, max: 300 },
        speed: { min: 1000, max: 1500 },
        quantity: 30,
        lifespan: 2000,
        scale: { start: 0.2, end: 0.1 },
        rotate: { start: 0, end: 360 },
        on: false
    });

  }

  update(time, delta) {
    destroyTanks(this);

    for (var key in this.tanks) {
      this.tanks[key].update(delta);
    }
  }

  initFood() {

  }


}

function destroyTanks(game) {
  for (var key in game.tanksToDestroy) {
    game.tanksToDestroy[key].destroy();
    for (var other in game.tanks) {
      if(game.tanks[other].id == game.tanksToDestroy[key].id) {
        game.tanks[other].alive = false;
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
