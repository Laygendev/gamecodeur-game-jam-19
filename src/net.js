class Net {
    id;
    
  constructor(game) {
    this.socket = io.connect("http://localhost:8080");

    this.socket.on('spawnPlayer', (data) => {
        let tank = new Player(data.player.id, game, {x: 50, y: 50});
        tank.create();
        game.tanks[data.player.id] = tank;
        
        this.id = data.player.id;
        console.log(game.tanks);
        game.scoreText.setText('Total Tanks: ' + Object.keys(game.tanks).length);
    });

    this.socket.on('addPlayer', (data) => {
      let tank = new Ennemy(data.player.id, game, {x: 50, y: 50});
      tank.create();
      game.tanks[data.player.id] = tank;
      game.scoreText.setText('Total Tanks: ' + Object.keys(game.tanks).length);
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
        game.tanks[hit.playerID].life--;
    });
  }

  updatePos(data) {
    this.socket.emit('UpdatePlayerPosition', data);
  }
  
  Shoot(data) {
      this.socket.emit('Shoot', data);
  }
}
