/**
 * @fileOverview Map class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Map. */
window.Map = class Map { // eslint-disable-line
  constructor (game, tilewidth, tileheight, width, height, layersInfo) {
    this.game = game
    this.tilewidth = tilewidth
    this.tileheight = tileheight
    this.width = width
    this.height = height
    this.layersInfo = layersInfo

    this.layers = []

    for (var key in this.layersInfo) {
      this.layers.push(new window.Layer(this.game, this.layersInfo[key]))
    }
  }

  getTilePos (index) {
    let row = parseInt(Math.ceil((index - 1) / this.game.ressources['tileset'].columns))
    let x = (((index - 1) * this.tilewidth) - ((row - 1) * this.game.ressources['tileset'].imagewidth))
    let y = (row - 1) * this.tileheight

    return {
      x: x,
      y: y
    }
  }
}
