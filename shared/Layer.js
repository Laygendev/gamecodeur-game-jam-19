var SharedUtil = typeof module === 'object' ? require( './Util') : Util // eslint-disable-line

var Layer = class Layer {
  constructor (object, layer) {
    this.object = object
    this.layer = layer

    if (typeof module !== 'object') {
      this.canvas = document.createElement('canvas')
      this.canvas.width = this.object.canvas.width
      this.canvas.height = this.object.canvas.height

      this.context = this.canvas.getContext('2d')
    }
  }

  drawLayer () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.object.tanks[this.object.id]) {
      let posTilesTankY = parseInt(this.object.tanks[this.object.id].position[1] / 40)
      let posTilesTankX = parseInt(this.object.tanks[this.object.id].position[0] / 40)
      for (let y = posTilesTankY - 20; y < posTilesTankY + 20; y++) {
        for (let x = posTilesTankX - 30; x < posTilesTankX + 30; x++) {
          var tile = this.object.ressources['tileset'].getTile(this.layer.data[((y * 20) + x)])
          if (!tile) {
            continue
          }

          var posTile = this.object.ressources['map'].getTilePos(this.layer.data[((y * 20) + x)])

          this.context.drawImage(this.object.ressources['tiles'], posTile.x, posTile.y, 40, 40, (x * 40) - this.object.camera.x, (y * 40) - this.object.camera.y, 40, 40)

          if (tile.collision) {
            var posCollider = [
              [x * 40 + tile.collision.x + tile.collision.polyline[0].x, y * 40 + tile.collision.y + tile.collision.polyline[0].y],
              [x * 40 + tile.collision.x + tile.collision.polyline[1].x, y * 40 + tile.collision.y + tile.collision.polyline[1].y]
            ]

            for (var i = 0; i < 2; i++) {
              this.context.fillRect(posCollider[i][0] - this.object.camera.x, posCollider[i][1] - this.object.camera.y, 5, 5)
            }
          }
        }
      }
    }
  }

  checkCollider (pos, nextPos) {
    let haveCollider = false
    let posTilesTankY = parseInt(pos[1] / 40)
    let posTilesTankX = parseInt(pos[0] / 40)
    for (let y = posTilesTankY - 20; y < posTilesTankY + 20; y++) {
      for (let x = posTilesTankX - 30; x < posTilesTankX + 30; x++) {
        var tile = this.object.ressources['tileset'].getTile(this.layer.data[((y * 20) + x)])

        if (!tile || !tile.collision) {
          continue
        }

        var posCollider = [
          [x * 40 + tile.collision.x - tile.collision.polyline[0].x, y * 40 + tile.collision.y + tile.collision.polyline[0].y],
          [x * 40 + tile.collision.x - tile.collision.polyline[1].x, y * 40 + tile.collision.y + tile.collision.polyline[1].y]
        ]

        haveCollider = SharedUtil.CollisionSegSeg(pos, nextPos, posCollider[0], posCollider[1])

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

if (typeof module === 'object') {
  module.exports = Layer // eslint-disable-line
}
