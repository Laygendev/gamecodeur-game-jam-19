/**
 * @fileOverview Drawing class handle all things need to be displayed on the
 * canvas
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line
import { Player } from './../Shared/Player' // eslint-disable-line
import { Util } from './../Shared/Util'
import { Constants } from './../Shared/Constants'

/** Class representing a Canvas. */
export class Drawing {
  /**
   * The game Object.
   *
   * @type {Game}
   */
  game: Game
  /**
   * Initialize data
   *
   * @param {Game} game - The game Object.
   */
  constructor (game: Game) {
    this.game = game
  }

  drawTiles (): void {
    let map: any = this.game.ressources['map']
    let layers: any = map.layers

    for (var key in layers) {
      layers[key].drawLayer()

      this.game.ctx.drawImage(layers[key].canvas, 0, 0)
    }
  }

  drawWorld (): void {
    // this.game.ctx.drawImage(this.game.ressources['house'], 500 - this.game.camera.x, 300 - this.game.camera.y)
    // this.game.ctx.drawImage(this.game.ressources['ile'], 2000 - this.game.camera.x, 2000 - this.game.camera.y)
  }

  drawTank (tank: Player): void {
    if ((tank.isVisibleTo(this.game.tanks[this.game.id]) && !tank.waitMessage) || tank.id === this.game.id) {
      this.game.ctx.save()
      this.game.ctx.translate(tank.position[0] - this.game.camera.x, tank.position[1] - this.game.camera.y)
      this.game.ctx.rotate(tank.orientation)

      if (tank.death) {
        this.game.ctx.globalAlpha = 0.5
      }

      this.game.ctx.drawImage(this.game.ressources['tank'], -70 / 2, -60 / 2)
      this.game.ctx.restore()

      this.game.ctx.save()
      this.game.ctx.translate(tank.position[0] - this.game.camera.x, tank.position[1] - this.game.camera.y)
      this.game.ctx.rotate(tank.turretAngle)

      if (tank.death) {
        this.game.ctx.globalAlpha = 0.5
      }

      this.game.ctx.drawImage(this.game.ressources['canon'], 20 + -this.game.ressources['canon'].width / 2, -this.game.ressources['canon'].height / 2)
      this.game.ctx.restore()

      if (!tank.death) {
        this.game.ctx.fillRect(tank.position[0] - this.game.camera.x - 50, tank.position[1] - this.game.camera.y - 50, 100, 10)
        this.game.ctx.save()
        this.game.ctx.fillStyle = '#556B2F'
        this.game.ctx.fillRect(tank.position[0] - this.game.camera.x - 50, tank.position[1] - this.game.camera.y - 50, tank.health * 100 / Constants.PLAYER_MAX_HEALTH, 10)
        this.game.ctx.restore()

        this.game.ctx.font = '26px Arial'
        this.game.ctx.fillText(tank.name, tank.position[0] - this.game.camera.x - this.game.ctx.measureText(tank.name).width / 2, tank.position[1] - this.game.camera.y - 70)
      }
    } else {
      tank.waitMessage = true
    }
  }

  drawBullet (bullet: any): void {
    var distance = Math.sqrt(Util.sqr(bullet.initPos[1] - bullet.position[1]) + Util.sqr(bullet.initPos[0] - bullet.position[0]))
    distance *= 0.3

    if (distance > 100) {
      distance = 100
    }

    for (var i = 0; i < distance; i++) {
      this.game.ctx.save()

      var copy = {
        x: bullet.position[0],
        y: bullet.position[1]
      }

      copy.x -= i * 5 * Math.cos(bullet.angle)
      copy.y -= i * 5 * Math.sin(bullet.angle)

      this.game.ctx.translate(copy.x - this.game.camera.x + this.game.ressources['fire'].width, copy.y - this.game.camera.y + this.game.ressources['fire'].height)
      this.game.ctx.rotate(bullet.angle)
      this.game.ctx.globalAlpha = (0.9 / i)

      this.game.ctx.drawImage(this.game.ressources['fire'], -this.game.ressources['fire'].width / 2, -this.game.ressources['fire'].height / 2)
      this.game.ctx.restore()
    }

    this.game.ctx.save()

    this.game.ctx.translate(bullet.position[0] - this.game.camera.x + this.game.ressources['fire'].width, bullet.position[1] - this.game.camera.y + this.game.ressources['fire'].height)
    this.game.ctx.rotate(bullet.angle)

    this.game.ctx.drawImage(this.game.ressources['fire'], -this.game.ressources['fire'].width / 2, -this.game.ressources['fire'].height / 2)
    this.game.ctx.restore()
  }

  drawUI (): void {

  }

  drawText (): void {
    let tank: Player = this.game.tanks[this.game.id]

    this.game.ctx.save()
    this.game.ctx.font = '20px Arial'
    this.game.ctx.fillText(this.game.latency + 'ms', 20, 40)
    this.game.ctx.fillText('X: ' + tank.position[0] + ' Y: ' + tank.position[1], 20, 65)
    this.game.ctx.restore()
  }
}