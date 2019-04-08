/**
 * @fileOverview Tiles class handle TSX.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Tiles. */
export class Tiles {
  public id: number
  public tilewidth: number
  public tileheight: number
  public collision: any

  constructor (id: number, tilewidth: number, tileheight: number, collision: any) {
    this.id = id
    this.tilewidth = tilewidth
    this.tileheight = tileheight

    this.collision = collision
  }
}
