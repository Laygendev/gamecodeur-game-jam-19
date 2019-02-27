class Net {
    id;
    init = false;
    isLookingForRoom = false;
    pseudo;
    room;

  constructor(game) {
    this.socket = io.connect("https://trackball-game.com:8080", {
      forceNew: true
    });

    this.socket.on('connect_error', () => {
        document.querySelector(".network-not-ready").innerHTML = "Server offline";
    });

    this.socket.on('reconnecting', (n) => {
        document.querySelector(".network-not-ready").innerHTML = "Try reconnecting #" + n;
    });

    this.socket.on('connected', (id) => {
        document.querySelector(".network-ready").style.display = 'block';
        document.querySelector(".network-not-ready").style.display = 'none';

        this.id = id;
    });

    this.socket.on('JoinedRoom', (room) => {
        this.room = room;

        document.querySelector(".network-ready .state").innerHTML = "Room #" + room.id + " " + room.numberPlayer + "/" + room.maxPlayer;
    });

    this.socket.on('spawnPlayer', (data) => {

        game.width  = data.map.width;
        game.height = data.map.height;

        game.start();

        let tank = new Player(data.player.id, game, data.player.pos);
        game.tanks[data.player.id] = tank;

        game.camera.setTarget(game.tanks[data.player.id], game.canvas.width / 2, game.canvas.height / 2);

        this.init = true;
        this.id = data.player.id;
        this.roomID = this.room.id;

        document.querySelector(".mask").style.display = "none";

    });

    this.socket.on('addPlayer', (data) => {
      let tank = new Ennemy(data.player.id, game, data.player.pos);
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
      data.roomID = this.room.id;
      this.socket.emit('UpdatePlayerPosition', data);
  }

  Shoot(data) {
      data.roomID = this.room.id;
      this.socket.emit('Shoot', data);
  }

  lookingForRoom() {
      if (!this.isLookingForRoom) {
          this.isLookingForRoom = true;
          document.querySelector(".network-ready .state").innerHTML = "Looking for room...";

          this.pseudo = document.querySelector(".pseudo").value;

          this.socket.emit('JoinRoom', {
              id: this.id,
              pseudo: this.pseudo,
          } );
      }
  }
}
