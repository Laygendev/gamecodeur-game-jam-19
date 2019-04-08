/**
 * @fileOverview Entity class handle method all entities need.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Util } from './Util'

/** Class represening an Entity. */
export class Entity {
  /**
   * Initialize position
   *
   * @type {Array}
   */
  public position: number[]

  protected screen: any

  /**
   * Initialize the position
   *
   * @param {Array} position - The position.
   */
  constructor (position: number[]) {
    this.position = position || [0, 0]
  }

  /**
   * Check if the entity other is visible by this entity
   *
   * @param {Entity} other - The other entity
   *
   * @return {Boolean}       True is visible, or false.
   */
  isVisibleTo (other: Entity): boolean {
    return Util.inBound(
      this.getX(),
      other.getX() - other.screen.w,
      other.getX() + other.screen.w) && Util.inBound(
      this.getY(),
      other.getY() - other.screen.h,
      other.getY() + other.screen.h)
  }

  /**
   * Return X
   *
   * @return {Number} X position.
   */
  getX (): number {
    return this.position[0]
  }

  /**
   * Return Y
   *
   * @return {number} Y position.
   */
  getY (): number {
    return this.position[1]
  }
}
