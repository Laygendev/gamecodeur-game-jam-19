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

  /**
   * Add ressoures JSON Tiles to load
   *
   * @param {String} id   - The ID of the ressources.
   * @param {String} path - The Abs path to the ressources.
   */
  loadJSONTile (id, path) {
    this.ressourcesToLoad[id] = {
      path: path,
      type: 'json',
      extra: 'tile'
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
          if ('tile' === this.ressourcesToLoad[keyb].extra) {
            this.game.ressources[keyb + 'Tiles'] = new Tiles(
              this.game.ressources[keyb].columns,
              this.game.ressources[keyb].tilewidth,
              this.game.ressources[keyb].tileheight,
              this.game.ressources[keyb].imagewidth
            );
          }
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

      // this.game.net = new Net(this.game);
    }
  }
}
