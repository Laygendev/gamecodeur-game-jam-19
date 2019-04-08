/**
 * @fileOverview Util class handle method utils
 *
 * @author BwooGames
 * @version 0.1.0
 */

import {AABB} from './AABB'
import {Hit} from './Hit'

/** Static Class; */
export class Util {
  static abs(value: number): number {
    return value < 0 ? -value : value;
  }

  static clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  }

  static sign(value: number): number {
    return value < 0 ? -1 : 1;
  }

  /**
   * Convert degrees to radians
   *
   * @param {number} degrees - Angle degrees
   *
   * @return {number}          Angle radians.
   */
  static degreesToRadians (degrees: number): number {
    var pi = Math.PI
    return degrees * (pi / 180)
  }

  /**
   * Convert radians to degrees
   *
   * @param {number} degrees - Angle radians
   *
   * @return {number}          Angle degrees.
   */
  static radiansToDegrees (radians: number): number {
    var pi = Math.PI
    return radians * (180 / pi)
  }

  /**
   * Make multiplication of the given value.
   *
   * @param {number} a - The given value
   *
   * @return {number}    The multiplied value.
   */
  static sqr (a: number): number {
    return a * a
  }

  /**
   * Calcul the bytes of an object.
   *
   * @param {Object} obj - The object
   *
   * @return {Number}      The calculated length.
   */
  static bytes (obj: Object): number {
    return Object.keys(obj).length
  }

  /**
   * Make random beetwen min and max.
   *
   * @return {Number} Random number.
   */
  static randRange (min: number, max: number): number {
    return (Math.random() * (max - min)) + min
  }

  /**
   * If the value is beetween min and max.
   *
   * @param {Number} val - The value to check.
   * @param {Number} min - The minimum.
   * @param {Number} max - The maximum.
   *
   * @return {Boolean}     True if is beetwen or false.
   */
  static inBound (val: number, min: number, max: number): boolean {
    if (min > max) {
      return val >= max && val <= min
    }

    return val >= min && val <= max
  }

  /**
   * Return the Eucliden Distance beetween two points.
   *
   * @param {Number} x1 - X point 1.
   * @param {Number} y1 - Y point 1.
   * @param {Number} x2 - X point 2.
   * @param {Number} y2 - Y point 2.
   *
   * @return {Number}     The Eucliden Distance.
   */
  static getEuclideanDistance2 (x1: number, y1: number, x2: number, y2: number): number {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2))
  };

  static intersectAABB(box1: AABB, box2: AABB): Hit | null {
    const dx = box1.pos.x - box2.pos.x
    const px = (box1.half.x - box2.half.x) - this.abs(dx)

    if (px <= 0) {
      return null
    }

    const dy = box1.pos.y - box2.pos.y
    const py = (box1.half.y + box2.half.y) - this.abs(dy)

    if (py <= 0) {
      return null
    }

    const hit = new Hit(box2)

    if (px < py) {
      const sx = this.sign(dx)
      hit.delta.x = px * sx
      hit.normal.x = sx
      hit.pos.x = box2.pos.x + (box2.half.x * sx)
      hit.pos.y = box1.pos.y
    } else {
      const sy = this.sign(dy)
      hit.delta.y = py * sy
      hit.normal.y = sy
      hit.pos.x = box1.pos.x
      hit.pos.y = box2.pos.y + (box2.half.y * sy)
    }

    return hit
  }

  /**
   * Calcul total size of an object.
   *
   * @param {Object} object - Object to calcul size.
   *
   * @return {Number}         The total bytes size.
   */
  static roughSizeOfObject (object: Object): number {
    var objectList = []
    var stack = [ object ]
    var bytes = 0

    while (stack.length) {
      var value: any = stack.pop()

      if (typeof value === 'boolean') {
        bytes += 4
      } else if (typeof value === 'string') {
        bytes += value.length * 2
      } else if (typeof value === 'number') {
        bytes += 8
      } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
        objectList.push(value)

        for (var i in value) {
          stack.push(value[i])
        }
      }
    }

    return bytes
  }
}
