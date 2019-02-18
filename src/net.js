class Net {
  constructor(game) {
    this.socket = io.connect("http://localhost:8080");

    this.socket.on('spawnPlayer', (data) => {
        let tank = new Player(data.player.id, game, {x: 50, y: 50});
        tank.create();
        game.tanks[data.player.id] = tank;
    });

    this.socket.on('addPlayer', (data) => {
      let tank = new Ennemy(data.player.id, game, {x: 50, y: 50});
      tank.create();
      game.tanks[data.player.id] = tank;
    });

    this.socket.on('UpdatePlayerPosition', (data) => {
      if (game.tanks[data.id] != undefined) {
        game.tanks[data.id].container.x = data.pos.x;
        game.tanks[data.id].container.y = data.pos.y;
      }
    });
  }

  updatePos(id, pos) {
    this.socket.emit('UpdatePlayerPosition', {
      id: id,
      pos: pos
    });
  }
}
