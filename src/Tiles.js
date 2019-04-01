/**
 * @fileOverview Tiles class handle TSX.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Tiles. */
window.Tiles = class Tiles { // eslint-disable-line
  constructor (id, tilewidth, tileheight, collision) {
    this.id = id
    this.tilewidth = tilewidth
    this.tileheight = tileheight

    this.collision = collision
  }
}
