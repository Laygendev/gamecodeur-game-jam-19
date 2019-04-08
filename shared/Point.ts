/**
 * @fileOverview Point class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Point. */
export class Point {
  public x: number
  public y: number

  constructor (x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  public clone(): Point {
    return new Point(this.x, this.y)
  }

  public normalize(): number {
    let length = this.x * this.x + this.y * this.y

    if (length > 0) {
      length = Math.sqrt(length)

      const inverseLength = 1.0 / length
      this.x *= inverseLength
      this.y *= inverseLength
    } else {
      this.x = 1
      this.y = 0
    }

    return length
  }
}
