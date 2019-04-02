/**
 * @fileOverview Tiles class handle TSX.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Tiles. */
var Tiles = class Tiles {
  constructor (id, tilewidth, tileheight, collision) {
    this.id = id
    this.tilewidth = tilewidth
    this.tileheight = tileheight

    this.collision = collision
  }
}

if (typeof module === 'object') {
  module.exports = Tiles // eslint-disable-line
}
