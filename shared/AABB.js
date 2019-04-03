/**
 * @fileOverview Sweep class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedHit = typeof module === 'object' ? require('./Hit') : Hit // eslint-disable-line
var SharedPoint = typeof module === 'object' ? require('./Point') : Point // eslint-disable-line

/** Class representing a Sweep. */
var AABB = class AABB {
  constructor (pos, half) {
    this.pos = pos
    this.half = half
  }
}

if (typeof module === 'object') {
  module.exports = AABB // eslint-disable-line
}
