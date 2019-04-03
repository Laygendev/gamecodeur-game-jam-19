/**
 * @fileOverview Util class handle method utils
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Static Class; */
var Util = class Util {
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
   * @param {Number} degrees - Angle degrees
   *
   * @return {Number}          Angle radians.
   */
  static degreesToRadians (degrees) {
    var pi = Math.PI
    return degrees * (pi / 180)
  }

  /**
   * Convert radians to degrees
   *
   * @param {Number} degrees - Angle radians
   *
   * @return {Number}          Angle degrees.
   */
  static radiansToDegrees (radians) {
    var pi = Math.PI
    return radians * (180 / pi)
  }

  /**
   * Make multiplication of the given value.
   *
   * @param {Number} a - The given value
   *
   * @return {Number}    The multiplied value.
   */
  static sqr (a) {
    return a * a
  }

  /**
   * Calcul the length of an object.
   *
   * @param {Object} obj - The object
   *
   * @return {Number}      The calculated length.
   */
  static length (obj) {
    return Object.keys(obj).length
  }

  /**
   * Make random beetwen min and max.
   *
   * @return {Number} Random number.
   */
  static randRange (min, max) {
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
  static inBound (val, min, max) {
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
  static getEuclideanDistance2 (x1, y1, x2, y2) {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2))
  };

  static intersectAABB(box1: AABB, box2: AABB): Hit | null {
    const dx = box1.pos.x - box2.pos.x
    const px = (box1.half.x - box2.half.x) - abs(dx)

    if (px <= 0) {
      return null
    }

    const dy = box1.pos.y - box2.pos.y
    const py = (box1.half.y + box2.half.y) - abs(dy)

    if (py <= 0) {
      return null
    }

    const hit = new Hit(box2)

    if (px < py) {
      const sx = sign(dx)
      hit.delta.x = px * sx
      hit.normal.x = sx
      hit.pos.x = box2.pos.x + (box2.half.x * sx)
      hit.pos.y = box1.pos.y
    } else {
      const sy = sign(dy)
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
  static roughSizeOfObject (object) {
    var objectList = []
    var stack = [ object ]
    var bytes = 0

    while (stack.length) {
      var value = stack.pop()

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

if (typeof module === 'object') {
  module.exports = Util // eslint-disable-line
}
