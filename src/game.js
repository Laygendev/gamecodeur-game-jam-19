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
    this.tanksToDestroy = [];
    this.group = this.add.group();

  }

  create() {
    var width = winW;
    var height = winH;

    this.cameras.main.setBounds(0, 0, width*4, height*4);

    var background = this.add.tileSprite(0, 0, width*8, height*8, 'background');

    this.scoreText = this.add.text(16, 16, 'Total Tanks: ' + this.tanks.length, { fontSize: '32px', fill: '#000' });
    this.scoreText.setScrollFactor(0);

    this.net = new Net(this);
  }

  update() {
    destroyTanks(this);

    for (var key in this.tanks) {
      this.tanks[key].update();
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
