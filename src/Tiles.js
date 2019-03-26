/**
 * @fileOverview Tiles class handle tilemap.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Tiles. */
window.Tiles = class Tiles { // eslint-disable-line
  constructor (columns, tilewidth, tileheight, imagewidth) {
    this.columns = columns
    this.tilewidth = tilewidth
    this.tileheight = tileheight
    this.imagewidth = imagewidth
  }

  getTile(index) {
    let row = parseInt(ceil(index / this.columns))
    let x = (((index - 1) * this.tilewidth) - ((row - 1) * this.imagewidth))
    let y = (row - 1) * this.tileheight

    return {
      x: x,
      y: y
    }
  }
}
