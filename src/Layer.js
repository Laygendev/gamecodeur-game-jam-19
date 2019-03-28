class Layer {
  constructor(game, layer) {
    this.game = game
    this.layer = layer

    this.canvas = document.createElement('canvas')
    this.canvas.width = this.game.canvas.width
    this.canvas.height = this.game.canvas.height

    this.context = this.canvas.getContext('2d')
  }

  drawLayer() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.game.tanks[this.game.id]) {
      let posTilesTankY = parseInt(this.game.tanks[this.game.id].position[1] / 40);
      let posTilesTankX = parseInt(this.game.tanks[this.game.id].position[0] / 40);
      for (let y = posTilesTankY - 20; y < posTilesTankY + 20; y++) {
        for (let x = posTilesTankX - 30; x < posTilesTankX + 30; x++) {
            var posTile = this.game.ressources['tilesTiles'].getTile(this.layer.data[((y * 1000) + x)])
            this.context.drawImage(this.game.ressources['tile'], posTile.x, posTile.y, 40, 40, (x * 40) - this.game.camera.x, (y * 40) - this.game.camera.y, 40, 40)
        }
      }
    }
  }
}
