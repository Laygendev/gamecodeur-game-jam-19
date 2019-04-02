/**
 * @fileOverview Load data
 *
 * @author BwooGames
 * @version 0.1.0
 */

const Map = require('./Map')
const Tileset = require('./Tileset')

/** Class represening a Load. */
class Load {
  constructor (server) {
    let data = require('./../asset/maptest.json')
    server.ressources['map'] = new Map(server, data.tilewidth, data.tileheight, data.width, data.height, data.layers)

    data = require('./../asset/Tiles.json')
    server.ressources['tileset'] = new Tileset(data.columns, data.imagewidth, data.imageheight, data.tilecount, data.tileheight, data.tilewidth, data.tiles)
  }
}

module.exports = Load
