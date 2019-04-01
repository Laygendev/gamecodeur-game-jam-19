window.Layer = class Layer {  // eslint-disable-line
  constructor (game, layer) {
    this.game = game
    this.layer = layer

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.game.canvas.width
    this.canvas.height = this.game.canvas.height

    this.context = this.canvas.getContext('2d')
  }

  drawLayer () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.game.tanks[this.game.id]) {
      let posTilesTankY = parseInt(this.game.tanks[this.game.id].position[1] / 40)
      let posTilesTankX = parseInt(this.game.tanks[this.game.id].position[0] / 40)
      for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
          var tile = this.game.ressources['tileset'].getTile(this.layer.data[((y * 20) + x)])
          if (!tile) {
            continue
          }

          var posTile = this.game.ressources['map'].getTilePos(this.layer.data[((y * 20) + x)])

          this.context.drawImage(this.game.ressources['tiles'], posTile.x, posTile.y, 40, 40, (x * 40) - this.game.camera.x, (y * 40) - this.game.camera.y, 40, 40)

          if (tile.collision) {
            var posCollider = [
              [x * 40 + tile.collision.x + tile.collision.polyline[0].x, y * 40 + tile.collision.y + tile.collision.polyline[0].y],
              [x * 40 + tile.collision.x + tile.collision.polyline[1].x, y * 40 + tile.collision.y + tile.collision.polyline[1].y]
            ]

            for (var i = 0; i < 2; i++) {
              this.context.fillRect(posCollider[i][0] - this.game.camera.x, posCollider[i][1] - this.game.camera.y, 5, 5)
            }
          }
        }
      }
    }
  }

  checkCollider (pos, nextPos) {
    let haveCollider = false;
    let posTilesTankY = parseInt(this.game.tanks[this.game.id].position[1] / 40)
    let posTilesTankX = parseInt(this.game.tanks[this.game.id].position[0] / 40)
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        var tile = this.game.ressources['tileset'].getTile(this.layer.data[((y * 20) + x)])

        if (!tile || !tile.collision) {
          continue
        }
        var posTile = this.game.ressources['map'].getTilePos(this.layer.data[((y * 20) + x)])

        var posCollider = [
          [x * 40 + tile.collision.x - tile.collision.polyline[0].x, y * 40 + tile.collision.y + tile.collision.polyline[0].y],
          [x * 40 + tile.collision.x - tile.collision.polyline[1].x, y * 40 + tile.collision.y + tile.collision.polyline[1].y]
        ]


        haveCollider = window.Util.CollisionSegSeg(pos, nextPos, posCollider[0], posCollider[1])

        if (haveCollider) {
          break
        }
      }

    if (haveCollider) {
        break
      }
    }

    return haveCollider
  }
}
