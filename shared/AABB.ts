/**
 * @fileOverview Sweep class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Point } from './Point' // eslint-disable-line

/** Class representing a Sweep. */
export class AABB {
  public pos: Point
  public half: Point

  constructor (pos: Point, half: Point) {
    this.pos = pos
    this.half = half
  }
}
