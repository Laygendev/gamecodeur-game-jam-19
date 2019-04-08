/**
 * @fileOverview Sweep class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Hit } from './Hit' // eslint-disable-line
import { Point } from './Point'

/** Class representing a Sweep. */
export class Sweep {
  public hit: Hit | null
  public pos: Point
  public time: number

  constructor () {
    this.hit = null
    this.pos = new Point()
    this.time = 1
  }
}
