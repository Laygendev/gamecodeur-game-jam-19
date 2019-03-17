class Game {
  constructor(socket) {
    this.socket = socket;

    this.started = false;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.t = 0;
    this.last_ts = 0;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ressources = [];
    this.tanks = [];
    this.bullets = [];

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

    this.input   = new Input(this);
    // this.camera  = new Camera(this);
    this.ui      = new UI(this);

    this.socket.on('update', (data) => { this.receiveGameState(data); });

    requestAnimationFrame(() => { this.gameLoop(); });
  }

  stop() {
    this.started = false;
    this.tanks   = [];
    this.bullets = [];
    this.net.reset();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  receiveGameState(state) {
    this.self = state['self'];
    // this.camera.target = this.self;
    this.tanks = state['players'];
  }

  gameLoop() {
    if (this.started) {
      var now_ts = +new Date();
      var last_ts = this.last_ts || now_ts;
      var dt_sec = (now_ts - last_ts) / 1000.0;
      this.last_ts = now_ts;

      this.update(dt_sec);
      this.draw(dt_sec);

    }

    requestAnimationFrame(() => { this.gameLoop(); });
  }

  update(dt) {
    this.ui.update(dt);

    var packet = {
      'keyboardState': {
        'up': this.input.keyPressed.up || this.input.keyPressed.Z,
        'left': this.input.keyPressed.left || this.input.keyPressed.Q,
        'right': this.input.keyPressed.right || this.input.keyPressed.D,
        'down': this.input.keyPressed.down || this.input.keyPressed.S
      },
      'timestamp': (new Date()).getTime()
    };

    this.socket.emit('player-action', packet);

    // this.camera.update();
  }

  draw(dt) {
    var tile = 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var x = 0; x < 1000; x += 40) {
      for (var y = 0; y < 1000; y += 40) {
        // if (this.camera.inViewport(x, y)) {
          this.ctx.drawImage(this.ressources['tile'], x, y);
          tile++;
        // }
      }
    }

    if (this.self) {
      this.drawTanks(this.self);
    }

    for (var key in this.tanks) {
      this.drawTanks(this.tanks[key]);
    }

    if (this.self) {
      this.ctx.save();
      this.ctx.font = "20px Arial";
      this.ctx.fillText('X: ' + parseInt(this.self.position[0]) + ' Y: ' + parseInt(this.self.position[1]), 20, 40);
      this.ctx.restore();
    }


    for (var key in this.bullets) {
      this.drawBullets(this.bullets[key], dt);
    }

    this.ui.draw();
  }

  drawTanks(tank) {
    this.ctx.save();
    this.ctx.translate(tank.position[0], tank.position[1]);
    // this.ctx.rotate(tank[2]);

    this.ctx.drawImage(this.ressources['tank'], -70 / 2, -60 / 2);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(tank.position[0], tank.position[1]);
    // this.ctx.rotate(tank[3]);

    this.ctx.drawImage(this.ressources['canon'], 20 + -this.ressources['canon'].width / 2, -this.ressources['canon'].height / 2);
    this.ctx.restore();
  }

  drawBullets(bullet, dt) {
    var distance = Math.sqrt(Util.sqr(bullet[3].y - bullet[1].y) + Util.sqr(bullet[3].x - bullet[1].x));
    distance *= 0.3;

    if (distance > 100) {
      distance = 100;
    }

    for (var i = 0; i < distance; i++) {
      this.ctx.save();

      var copy = {
        x: bullet[1].x,
        y: bullet[1].y
      };

      copy.x -= i * 200 * dt * Math.cos(bullet[2]);
      copy.y -= i * 200 * dt * Math.sin(bullet[2]);

      this.ctx.translate(copy.x - this.camera.x + this.ressources['fire'].width, copy.y - this.camera.y + this.ressources['fire'].height);
      this.ctx.rotate(bullet[2]);
      this.ctx.globalAlpha = (0.9 / i);

      this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
      this.ctx.restore();
    }

    this.ctx.save();

    this.ctx.translate(bullet[1].x - this.camera.x + this.ressources['fire'].width, bullet[1].y - this.camera.y + this.ressources['fire'].height);
    this.ctx.rotate(bullet[2]);

    this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2);
    this.ctx.restore();
  }

}
