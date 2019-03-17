var Entity = require('./Entity');
var World = require('./World');
var Util = require( './Util');

class Player extends Entity {
  constructor(position, orientation, name, id) {
    super(position);

    this.position = position;
    this.velocity = [0, 0];
    this.acceleration = [0, 0];

    this.orientation = orientation;
    this.turretAngle = orientation;

    this.name = name;
    this.id = id;

    this.vmag = 300;
  }

  static generateNewPlayer(name, id) {
    var point = [0, 0];
    var orientation = Util.randRange(0, 2 * Math.PI);
    return new Player(point, orientation, name, id);
  }

  updateOnInput(keyboardState, turretAngle) {
    if (keyboardState.up) {
      this.velocity = [0, -this.vmag];
    }

    if (keyboardState.down) {
      this.velocity = [0, this.vmag];
    }

    if (keyboardState.left) {
      this.velocity = [-this.vmag, 0];

    }

    if (keyboardState.right) {
      this.velocity = [this.vmag, 0];
    }
  }

  update() {
    super.update();
  }
}

module.exports = Player;
