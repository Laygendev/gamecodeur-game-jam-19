/**
 * @fileOverview Tileset class handle TSX.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Tiles } from './Tiles'

/** Class representing a Tileset. */
export class Tileset {
  public columns: number
  public imagewidth: number
  public imageheight: number
  public tilecount: number
  public tileheight: number
  public tilewidth: number
  public tilesInfo: any

  public tiles: Tiles[]

  constructor (columns: number, imagewidth: number, imageheight: number, tilecount: number, tileheight: number, tilewidth: number, tilesInfo: any) {
    this.columns = columns
    this.imagewidth = imagewidth
    this.imageheight = imageheight
    this.tilecount = tilecount
    this.tilewidth = tilewidth
    this.tileheight = tileheight

    this.tilesInfo = tilesInfo

    this.tiles = []

    for (var i = 0; i < tilecount; i++) {
      this.tiles.push(new Tiles(i, this.tilewidth, this.tileheight, this.searchTileCollision(i)))
    }
  }

  getTile (index: number): Tiles {
    return this.tiles[index]
  }

  searchTileCollision (index: number): Tiles | undefined {
    for (var key in this.tilesInfo) {
      if (this.tilesInfo[key].id === index - 1) {
        return this.tilesInfo[key].objectgroup.objects[0]
      }
    }

    return undefined
  }
}
