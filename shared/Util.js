/**
 * @fileOverview Util class handle method utils
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Static Class; */
var Util = class Util {
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

  /**
   * Check collision beetwen two segments.
   *
   * @param {Array} A - Point A From segment 1.
   * @param {Array} B - Point B From segment 1.
   * @param {Array} O - Point A From segment 2.
   * @param {Array} P - Point B From segment 2.
   *
   * @return Boolean    True if segments is intersect or false.
   */
  static CollisionDroiteSeg (A, B, O, P) {
    var AO = [0, 0]
    var AP = [0, 0]
    var AB = [0, 0]

    AB[0] = B[0] - A[0]
    AB[1] = B[1] - A[1]
    AP[0] = P[0] - A[0]
    AP[1] = P[1] - A[1]
    AO[0] = O[0] - A[0]
    AO[1] = O[1] - A[1]

    if ((AB[0] * AP[1] - AB[1] * AP[0]) * (AB[0] * AO[1] - AB[1] * AO[0]) < 0) {
      return true
    } else {
      return false
    }
  }

  /**
   * Test Intersect collision from two segments
   *
   * @param {Array} A - Point A From segment 1.
   * @param {Array} B - Point B From segment 1.
   * @param {Array} O - Point A From segment 2.
   * @param {Array} P - Point B From segment 2.
   *
   * @return Boolean    True if segments is intersect or false.
   */
  static CollisionSegSeg (A, B, O, P) {
    if (Util.CollisionDroiteSeg(A, B, O, P) === false) {
      return false
    }

    if (Util.CollisionDroiteSeg(O, P, A, B) === false) {
      return false
    }

    return true
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
