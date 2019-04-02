/**
 * @fileOverview Tileset class handle TSX.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedTiles = typeof module === 'object' ? require('./Tiles') : window.Tiles // eslint-disable-line

/** Class representing a Tileset. */
var Tileset = class Tileset {
  constructor (columns, imagewidth, imageheight, tilecount, tileheight, tilewidth, tilesInfo) {
    this.columns = columns
    this.imagewidth = imagewidth
    this.imageheight = imageheight
    this.tilewidth = tilewidth
    this.tileheight = tileheight
    this.tilecount = tilecount

    this.tilesInfo = tilesInfo

    this.tiles = []

    for (var i = 0; i < tilecount; i++) {
      this.tiles.push(new SharedTiles(i, this.tilewidth, this.tileheight, this.searchTileCollision(i)))
    }
  }

  getTile (index) {
    return this.tiles[index]
  }

  searchTileCollision (index) {
    for (var key in this.tilesInfo) {
      if (this.tilesInfo[key].id === index - 1) {
        return this.tilesInfo[key].objectgroup.objects[0]
      }
    }

    return undefined
  }
}

if (typeof module === 'object') {
  module.exports = Tileset // eslint-disable-line
}
