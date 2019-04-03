/**
 * @fileOverview Sweep class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedHit = typeof module === 'object' ? require('./Hit') : Hit // eslint-disable-line
var SharedPoint = typeof module === 'object' ? require('./Point') : Point // eslint-disable-line

/** Class representing a Sweep. */
var Sweep = class Sweep {
  constructor () {
    this.hit = null
    this.pos = new SharedPoint()
    this.time = 1
  }
}

if (typeof module === 'object') {
  module.exports = Sweep // eslint-disable-line
}
