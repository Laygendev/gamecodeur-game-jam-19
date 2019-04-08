/**
 * @fileOverview Map class handle Tiled JSON.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import {Layer} from './Layer'

/** Class representing a Map. */
export class Map {
  public object: any
  public tilewidth: number
  public tileheight: number
  public width: number
  public height: number
  public layersInfo: any

  public layers: Layer[]

  constructor (object: any, tilewidth: number, tileheight: number, width: number, height: number, layersInfo: any) {
    this.object = object
    this.tilewidth = tilewidth
    this.tileheight = tileheight
    this.width = width
    this.height = height
    this.layersInfo = layersInfo
    this.layers = []

    for (var key in this.layersInfo) {
      this.layers.push(new Layer(this.object, this.layersInfo[key]))
    }
  }

  getTilePos (index: number): Object {
    let row = Math.ceil((index - 1) / this.object.ressources['tileset'].columns)
    let x = (((index - 1) * this.tilewidth) - ((row - 1) * this.object.ressources['tileset'].imagewidth))
    let y = (row - 1) * this.tileheight

    return {
      x: x,
      y: y
    }
  }
}
