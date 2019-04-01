/**
 * @fileOverview Loader class handle load ressources assets: Image, JSON,
 * Sound.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Loader. */
window.Loader = class Loader {  // eslint-disable-line
  /**
  * Constructor init data.
  *
  * @param {Game} game - Game Object.
  */
  constructor (game) {
    /**
     * The Game object
     *
     * @type {Game}
     */
    this.game = game

    /**
     * An array of ressources to load.
     *
     * @type {Array}
     */
    this.ressourcesToLoad = []

    /**
     * Ressources is loaded ?
     *
     * @type {Boolean}
     */
    this.isLoaded = false

    /**
     * Number of ressources loaded.
     *
     * @type {Number}
     */
    this.nbLoad = 0
  }

  /**
   * Add ressource Image to load.
   *
   * @param {String} id   - The ID of the ressources.
   * @param {String} path - The Abs path to the ressources.
   */
  loadImage (id, path) {
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
  loadJSON (id, path) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'json'
    }
  }

  loadJSONMap (id, path) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'map'
    }
  }

  loadJSONTileset (id, path) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'tileset'
    }
  }

  /**
   * Start load
   */
  start () {
    for (var key in this.ressourcesToLoad) {
      if (this.ressourcesToLoad[key].type === 'image') {
        this.game.ressources[key] = new window.Image()
        this.game.ressources[key].addEventListener('load', () => {
          this.nbLoad++
          this.checkAllLoad()
        })

        this.game.ressources[key].src = this.ressourcesToLoad[key].path
      } else if (this.ressourcesToLoad[key].type === 'json') {
        this.game.ressources[key] = {}

        window.xhrJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb, text) => {
          this.game.ressources[keyb] = JSON.parse(text)
          this.nbLoad++
          this.checkAllLoad()
        })
      } else if (this.ressourcesToLoad[key].type === 'map') {
        this.game.ressources[key] = {}
        window.xhrJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb, text) => {
          let tmpData = JSON.parse(text)
          this.game.ressources[keyb] = new Map(this.game, tmpData.tilewidth, tmpData.tileheight, tmpData.width, tmpData.height, tmpData.layers)

          this.nbLoad++
          this.checkAllLoad()
        })
      } else if (this.ressourcesToLoad[key].type === 'tileset') {
        this.game.ressources[key] = {}

        window.xhrJSON.loadJSON(key, this.ressourcesToLoad[key].path, (keyb, text) => {
          let tmpData = JSON.parse(text)
          this.game.ressources[keyb] = new window.Tileset(tmpData.columns, tmpData.imagewidth, tmpData.imageheight, tmpData.tilecount, tmpData.tileheight, tmpData.tilewidth, tmpData.tiles)

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
    if (this.nbLoad === window.Util.length(this.ressourcesToLoad)) {
      this.isLoaded = true

      this.game.htmlUI.displayMainMenu()
    }
  }
}
