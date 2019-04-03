/**
 * @fileOverview Hit class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedPoint = typeof module === 'object' ? require('./Point') : Point // eslint-disable-line

/** Class representing a Hit. */
var Hit = class Hit {
  constructor (collider) {
    this.collider = collider
    this.pos = new SharedPoint()
    this.delta = new SharedPoint()
    this.normal = new SharedPoint()
    this.time = 0
  }
}

if (typeof module === 'object') {
  module.exports = Hit // eslint-disable-line
}
