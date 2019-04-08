/**
 * @fileOverview Loader class handle load ressources assets: Image, JSON,
 * Sound.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line
import { XHRJSON } from './XHRJson' // eslint-disable-line
import { Map } from './../Shared/Map'
import { Tileset } from './../Shared/Tileset'
import { Util } from './../Shared/Util'

/** Class representing a Loader. */
export class Loader {
  /**
   * The Game object
   *
   * @type {Game}
   */
  game: Game

  /**
   * An array of ressources to load.
   *
   * @type {any}
   */
  ressourcesToLoad: any

  /**
   * Ressources is loaded ?
   *
   * @type {Boolean}
   */
  isLoaded: boolean

  /**
   * Number of ressources loaded.
   *
   * @type {Number}
   */
  nbLoad: number

  /**
  * Constructor init data.
  *
  * @param {Game} game - Game Object.
  */
  constructor (game: Game) {
    this.game = game
    this.ressourcesToLoad = []
    this.isLoaded = false
    this.nbLoad = 0
  }

  /**
   * Add ressource Image to load.
   *
   * @param {String} id   - The ID of the ressources.
   * @param {String} path - The Abs path to the ressources.
   */
  loadImage (id: string, path: string) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'image'
    }
  }

  /**
   * Add ressoures JSON to load
   *
   * @param {String} id   - The ID of the ressources.
   * @param {String} path - The Abs path to the ressources.
   */
  loadJSON (id: string, path: string) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'json'
    }
  }

  loadJSONMap (id: string, path: string) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'map'
    }
  }

  loadJSONTileset (id: string, path: string) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'tileset'
    }
  }

  /**
   * Start load
   */
  start (): void {
    for (var key in this.ressourcesToLoad) {
      if (this.ressourcesToLoad[key].type === 'image') {
        this.game.ressources[key] = new Image() // eslint-disable-line
        this.game.ressources[key].addEventListener('load', () => {
          this.nbLoad++
          this.checkAllLoad()
        })

        this.game.ressources[key].src = this.ressourcesToLoad[key].path
      } else if (this.ressourcesToLoad[key].type === 'json') {
        this.game.ressources[key] = {}

        XHRJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb: string, text: string) => {
          this.game.ressources[keyb] = JSON.parse(text)
          this.nbLoad++
          this.checkAllLoad()
        })
      } else if (this.ressourcesToLoad[key].type === 'map') {
        this.game.ressources[key] = {}
        XHRJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb: string, text: string) => {
          let tmpData = JSON.parse(text)
          this.game.ressources[keyb] = new Map(this.game, tmpData.tilewidth, tmpData.tileheight, tmpData.width, tmpData.height, tmpData.layers)

          this.nbLoad++
          this.checkAllLoad()
        })
      } else if (this.ressourcesToLoad[key].type === 'tileset') {
        this.game.ressources[key] = {}

        XHRJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb: string, text: string) => {
          let tmpData = JSON.parse(text)
          this.game.ressources[keyb] = new Tileset(tmpData.columns, tmpData.imagewidth, tmpData.imageheight, tmpData.tilecount, tmpData.tileheight, tmpData.tilewidth, tmpData.tiles)

          this.nbLoad++
          this.checkAllLoad()
        })
      }

      this.game.ressources[key].isLoaded = false
    }
  }

  /**
   * Check if all data is isLoaded
   */
  checkAllLoad () {
    if (this.nbLoad === Util.bytes(this.ressourcesToLoad)) {
      this.isLoaded = true

      this.game.htmlUI.displayMainMenu()
    }
  }
}
