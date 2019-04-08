/**
 * @fileOverview Hit class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Point } from './Point'

/** Class representing a Hit. */
export class Hit {
  public collider: any
  public pos: Point
  public delta: Point
  public normal: Point
  public time: Number

  constructor (collider: any) {
    this.collider = collider
    this.pos = new Point()
    this.delta = new Point()
    this.normal = new Point()
    this.time = 0
  }
}
