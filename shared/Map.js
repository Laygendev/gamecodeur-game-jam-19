/**
 * @fileOverview Map class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedLayer = typeof module === 'object' ? require('./Layer') : Layer // eslint-disable-line

/** Class representing a Map. */
var Map = class Map {
  constructor (object, tilewidth, tileheight, width, height, layersInfo) {
    this.object = object
    this.tilewidth = tilewidth
    this.tileheight = tileheight
    this.width = width
    this.height = height
    this.layersInfo = layersInfo

    this.layers = []

    for (var key in this.layersInfo) {
      this.layers.push(new SharedLayer(this.object, this.layersInfo[key]))
    }
  }

  getTilePos (index) {
    let row = parseInt(Math.ceil((index - 1) / this.object.ressources['tileset'].columns))
    let x = (((index - 1) * this.tilewidth) - ((row - 1) * this.object.ressources['tileset'].imagewidth))
    let y = (row - 1) * this.tileheight

    return {
      x: x,
      y: y
    }
  }
}

if (typeof module === 'object') {
  module.exports = Map // eslint-disable-line
}
