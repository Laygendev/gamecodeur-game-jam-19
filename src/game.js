class Game {
  constructor(socket) {
    this.socket = socket;

    this.id = null;
    this.pendingInputs = [];

    this.started = false;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.t = 0;
    this.lastTimestamp = 0;
    this.inputSequenceNumber = 0;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ressources = [];
    this.tanks = [];
    this.projectiles = [];

    this.input = null;
    this.camera = undefined;
    this.ui = undefined;
    this.room = new Room(this, this.socket);
    this.htmlUI = new htmlUI(this, this.socket);

    this.loader = new Loader(this);
    this.loader.loadImage('tile', 'asset/tile.png');
    this.loader.loadImage('tank', 'asset/tank.png');
    this.loader.loadImage('canon', 'asset/canon.png');
    this.loader.loadImage('fire', 'asset/fire.png');
    this.loader.loadImage('endcanon', 'asset/endcanon.png');
    this.loader.loadImage('ile', 'asset/ile.png');
    this.loader.loadJSON('worldCollider', 'asset/worldCollider.json');

    this.loader.start();

    this.self = null;
  }

  start() {
    this.started = true;

    this.htmlUI.switchUI();

    this.input = new Input(this);
    this.ui = new UI(this);

    requestAnimationFrame(() => { this.gameLoop(); });
  }

  stop() {
    this.started = false;
    this.tanks   = [];
    this.projectiles = [];
    this.htmlUI.isLookingForRoom = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addPlayer(data) {
    this.tanks[data.id] = new Player(data.position, data.orientation, data.name, data.id, data.screen);

    if (this.id === data.id) {
      this.camera = new Camera(this);
      this.camera.setTarget(this.tanks[this.id], data.screen.hW, data.screen.hH);
    }
  }

  removePlayer(id) {
    delete this.tanks[id];
  }

  gameLoop() {
    if (this.started) {
      var nowTimestamp = +new Date();
      var lastTimestamp = this.lastTimestamp || nowTimestamp;
      var dtSec = (nowTimestamp - lastTimestamp) / 1000.0;
      this.lastTimestamp = nowTimestamp;

      this.update(dtSec);
      this.draw(dtSec);
    }

    requestAnimationFrame(() => { this.gameLoop(); });
  }

  update(dt) {
    this.ui.update(dt);
    this.processInput(dt);
    this.camera.update();
    this.room.update();
  }

  processInput(dtSec) {
    this.tanks[this.id].turretAngle = Math.atan2((this.input.mousePosition.y + this.camera.y) - this.tanks[this.id].position[1],
                                                (this.input.mousePosition.x + this.camera.x) - this.tanks[this.id].position[0]);
    var input = {};

    input[0] = this.id;
    input[1] = this.latency;
    input[2] = this.inputSequenceNumber++;
    input[3] = this.tanks[this.id].turretAngle;
    input[4] = this.input.leftClickPressed;

    input[8] = 0; // UP
    input[9] = 0; // LEFT
    input[10] = 0; // RIGHT
    input[11] = 0; // DOWN

    if (this.input.keyPressed.up || this.input.keyPressed.Z) {
      input[8] = dtSec;
    }

    if (this.input.keyPressed.left || this.input.keyPressed.Q) {
      input[9] = dtSec;
    }

    if (this.input.keyPressed.right || this.input.keyPressed.D) {
      input[10] = dtSec;
    }

    if (this.input.keyPressed.down || this.input.keyPressed.S) {
      input[11] = dtSec;
    }

    this.tanks[this.id].updateOnInput(input);
    this.socket.emit('player-action', input);

    this.pendingInputs.push(input);
  }

  draw(dt) {
    var tile = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var x = 0; x < Constants.WORLD_MAX; x += 40) {
      for (var y = 0; y < Constants.WORLD_MAX; y += 40) {
        if (this.camera.inViewport(x, y)) {
          this.ctx.drawImage(this.ressources['tile'], x - this.camera.x, y - this.camera.y);
          tile++;
        }
      }
    }

    for (var key in this.projectiles) {
      this.drawBullets(this.projectiles[key], dt);
    }

    for (var key in this.tanks) {
      this.drawTanks(this.tanks[key]);
    }

    if (this.tanks[this.id]) {
      this.ctx.save();
      this.ctx.font = "20px Arial";
      this.ctx.fillText('X: ' + parseInt(this.tanks[this.id].position[0]) + ' Y: ' + parseInt(this.tanks[this.id].position[1]), 20, 40);
      this.ctx.restore();
    }

    this.ui.draw();
  }

  drawTanks(tank) {
    if (tank.isVisibleTo(this.tanks[this.id]) && !tank.waitMessage || tank.id == this.id) {
      this.ctx.save();
      this.ctx.translate(tank.position[0] - this.camera.x, tank.position[1] - this.camera.y);
      this.ctx.rotate(tank.orientation);

      if (tank.death) {
        this.ctx.globalAlpha = 0.5;
      }

      this.ctx.drawImage(this.ressources['tank'], -70 / 2, -60 / 2);
      this.ctx.restore();

      this.ctx.save();
      this.ctx.translate(tank.position[0] - this.camera.x, tank.position[1] - this.camera.y);
      this.ctx.rotate(tank.turretAngle);

      if (tank.death) {
        this.ctx.globalAlpha = 0.5;
      }

      this.ctx.drawImage(this.ressources['canon'], 20 + -this.ressources['canon'].width / 2, -this.ressources['canon'].height / 2);
      this.ctx.restore();

      if (!tank.death) {
        this.ctx.fillRect(tank.position[0] - this.camera.x - 50, tank.position[1] - this.camera.y - 50, 100, 10);
        this.ctx.save();
        this.ctx.fillStyle = "#556B2F";
        this.ctx.fillRect(tank.position[0] - this.camera.x - 50, tank.position[1] - this.camera.y - 50, tank.health * 100 / Constants.PLAYER_MAX_HEALTH, 10);
        this.ctx.restore();

        this.ctx.font = "26px Arial";
        this.ctx.fillText(tank.name, tank.position[0] - this.camera.x - this.ctx.measureText(tank.name).width / 2, tank.position[1] - this.camera.y - 70);
      }
    } else {
      tank.waitMessage = true;
    }
  }

  drawBullets(bullet, dt) {
    var distance = Math.sqrt(Util.sqr(bullet.initPos[1] - bullet.position[1]) + Util.sqr(bullet.initPos[0] - bullet.position[0]));
    distance *= 0.3;

    if (distance > 100) {
      distance = 100;
    }

    for (var i = 0; i < distance; i++) {
      this.ctx.save();

      var copy = {
        x: bullet.position[0],
        y: bullet.position[1]
      };

      copy.x -= i * 200 * dt * Math.cos(bullet.angle);
      copy.y -= i * 200 * dt * Math.sin(bullet.angle);

      this.ctx.translate(copy.x - this.camera.x + this.ressources['fire'].width, copy.y - this.camera.y + this.ressources['fire'].height);
      this.ctx.rotate(bullet.angle);
      this.ctx.globalAlpha = (0.9 / i);

      this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
      this.ctx.restore();
    }

    this.ctx.save();

    this.ctx.translate(bullet.position[0] - this.camera.x + this.ressources['fire'].width, bullet.position[1] - this.camera.y + this.ressources['fire'].height);
    this.ctx.rotate(bullet.angle);

    this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
    this.ctx.restore();
  }

}
