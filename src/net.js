class Net {
    id;
    init = false;

  constructor(game) {
    this.socket = io.connect("https://trackball-game.com:8080", {
      forceNew: true
    });

    this.socket.on('spawnPlayer', (data) => {
        game.width = data.map.width;
        game.height = data.map.height;
        let tank = new Player(data.player.id, game, {x: 50, y: 50});
        game.tanks[data.player.id] = tank;
        game.camera.setTarget(game.tanks[data.player.id], game.canvas.width / 2, game.canvas.height / 2);
        this.init = true;
        this.id = data.player.id;
    });

    this.socket.on('addPlayer', (data) => {
      let tank = new Ennemy(data.player.id, game, {x: 0, y: 0});
      // tank.create();
      game.tanks[data.player.id] = tank;
    });

    this.socket.on('UpdatePlayerPosition', (data) => {
        if (data.id == this.id) {
            return;
        }

      if (game.tanks[data.id] != undefined) {
        game.tanks[data.id].pos.x = data.x;
        game.tanks[data.id].pos.y = data.y;
        game.tanks[data.id].angle = data.angle;
        game.tanks[data.id].canonAngle = data.canonAngle;
        game.tanks[data.id].posCanon = data.posCanonServer;
        game.tanks[data.id].colliderPoint = data.colliderPointServer;
      }
    });

    this.socket.on('Shoot', (data) => {
        game.bullets[data.bulletid] = data;
    });

    this.socket.on("Bullet", (data) => {
        game.bullets[data.id].sprite.x = data.pos.x;
        game.bullets[data.id].sprite.y = data.pos.y;
    });

    this.socket.on("HitPlayer", (hit) => {
        game.tanks[hit.playerID].life = hit.player.life;
        game.tanks[hit.playerID].isAlive = hit.player.isAlive;

        delete game.bullets[hit.bulletID];


        // Delete tank
        if (!hit.player.isAlive) {
          if (hit.playerID != this.id) {
            delete game.tanks[hit.playerID];
          } else {
            game.tanks[hit.playerID].isSpectator = true;
          }
        }
    });

    this.socket.on("MissileDelete", (missile) => {
        for (var key in game.bullets) {
            if( game.bullets[key].bulletid == missile.bulletid) {
                delete game.bullets[key];
                break;
            }
        }
    });

    this.socket.on("RemovePlayer", (data) => {
      delete game.tanks[data.player.id];
    });
  }

  updatePos(data) {
    this.socket.emit('UpdatePlayerPosition', data);
  }

  Shoot(data) {
      this.socket.emit('Shoot', data);
  }
}
