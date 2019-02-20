class Net {
    id;

  constructor(game) {
    this.socket = io.connect("http://localhost:8080");

    this.socket.on('spawnPlayer', (data) => {
        let tank = new Player(data.player.id, game, {x: 0, y: 0});
        // tank.create();
        game.tanks[data.player.id] = tank;

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
        game.tanks[data.id].container.x = data.x;
        game.tanks[data.id].container.y = data.y;
        game.tanks[data.id].sprite.angle = data.angle;
        game.tanks[data.id].canon.angle = data.canonAngle;
        game.tanks[data.id].endcanon.x = data.endcanon.x;
        game.tanks[data.id].endcanon.y = data.endcanon.y;

        for (var i = 0; i < 4; i++) {
            game.tanks[data.id].colliderPoint[i].x = data.colliderPos[i].x;
            game.tanks[data.id].colliderPoint[i].y = data.colliderPos[i].y;
        }
      }
    });

    this.socket.on('Shoot', (data) => {
        data.sprite = game.add.sprite(data.basePos.x, data.basePos.y, 'fire');
        data.sprite.angle = data.endcanonangle;
        game.bullets[data.bulletid] = data;
    });

    this.socket.on("Bullet", (data) => {
        game.bullets[data.id].sprite.x = data.pos.x;
        game.bullets[data.id].sprite.y = data.pos.y;
    });

    this.socket.on("HitPlayer", (hit) => {
        game.tanks[hit.playerID].life = hit.player.life;
        game.tanks[hit.playerID].isAlive = hit.player.isAlive;

        if (! hit.player.isAlive) {
          game.tanksToDestroy.push(game.tanks[hit.playerID]);
        }
    });
    
    this.socket.on("MissileDelete", (missile) => {
        game.bullets[missile.bulletid].sprite.destroy();
        for (var key in game.bullets) {
            if( game.bullets[key].bulletid == missile.bulletid) {
                game.particles.emitParticleAt(missile.pos.x, missile.pos.y);
                game.bullets.splice(key, 1);
                break;
            }
        }
    });
  }

  updatePos(data) {
    this.socket.emit('UpdatePlayerPosition', data);
  }

  Shoot(data) {
      this.socket.emit('Shoot', data);
  }
}
