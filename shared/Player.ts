/**
 * @fileOverview Player class handle input, position, shoot cooldown, speed
 * cooldown and Damage taken.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Entity } from './Entity'
import { Constants } from './Constants'
import { Util } from './Util'
import { World } from './World'

/** Class representing a Player. */
export class Player extends Entity {
  /**
   * Setter orientation
   *
   * @type {Number}
   */
  public orientation: number

  /**
   * Setter name
   *
   * @type {String}
   */
  public name: string

  /**
   * Setter ID
   *
   * @type {Number}
   */
  public id: number

  /**
   * Setter screen
   *
   * @type {Object}
   */
  public screen: Object

  /**
   * The turret angle (degrees)
   *
   * @type {Number}
   */
  public turretAngle: number

  /**
   * The Vector velocity
   *
   * @type {Array}
   */
  public velocity: number[]

  /**
   * The friction for velocity calcul.
   *
   * @type {Number}
   */
  public friction: number

  /**
   * The speed of the player.
   *
   * @type {Number}
   */
  public speed: number

  /**
   * The timestamp of the last shoot.
   *
   * @type {Number}
   */
  public lastShotTime: number

  /**
   * The shotcoldown in MS.
   *
   * @type {Number}
   */
  public shotCooldown: number

  /**
   * The timestamp of the last speed action.
   *
   * @type {Number}
   */
  public lastSpeedTime: number

  /**
   * Can do speed action.
   *
   * @type {Boolean}
   */
  public canSpeed: boolean

  /**
   * The speed cooldown in MS.
   *
   * @type {Number}
   */
  public speedCooldown: number

  /**
   * Count number of processed input for no make an applyInput already make.
   *
   * @type {Number}
   */
  public lastProcessedInput: number

  /**
   * A buffer of position for make interpolate client. Only used in client
   * side.
   *
   * @type {Array}
   */
  public positionBuffer: any

  /**
   * Waiting message from server.
   *
   * @type {Boolean}
   */
  public waitMessage: boolean

  /**
   * Size of hitbox
   *
   * @type {Number}
   */
  public hitboxSize: number

  /**
   * Health of player.
   *
   * @type {Number}
   */
  public health: number

  /**
   * Number kill of player.
   *
   * @type {Number}
   */
  public kills: number

  /**
   * Player is death ?
   *
   * @type {Boolean}
   */
  public death: boolean

  /**
   * Initialise data
   *
   * @param {Array} position     - The position.
   * @param {Number} orientation - The degrees angle.
   * @param {String} name        - The name of the player.
   * @param {Number} id          - The socket ID.
   * @param {Object} screen      - The browser screen of the client.
   */
  constructor (position: number[], orientation: number, name: string, id: number, screen: Object) {
    super(position)

    this.position = position
    this.orientation = orientation
    this.name = name
    this.id = id
    this.screen = screen

    this.turretAngle = orientation
    this.velocity = [0, 0]
    this.friction = 0.95
    this.speed = Constants.DEFAULT_SPEED
    this.lastShotTime = 0
    this.shotCooldown = Constants.DEFAULT_SHOT_COOLDOWN
    this.lastSpeedTime = 0
    this.canSpeed = true
    this.speedCooldown = Constants.DEFAULT_SPEED_COOLDOWN
    this.lastProcessedInput = 0
    this.positionBuffer = []
    this.waitMessage = true
    this.hitboxSize = Constants.DEFAULT_HITBOX_SIZE
    this.health = Constants.PLAYER_MAX_HEALTH
    this.kills = 0
    this.death = false
  }

  /**
   * Generate a new Player with random position and angle and return it.
   *
   * @param {String} name   - Player name.
   * @param {Number} id     - Socket ID.
   * @param {Object} screen - Browser of player info.
   *
   * @return {Player}       - The new created player.
   */
  static generateNewPlayer (name: string, id: number, screen: Object): Player {
    var point = World.getRandomPoint()
    var orientation = Util.randRange(0, 2 * Math.PI)

    return new Player(point, orientation, name, id, screen)
  }

  /**
   * Update the player info.
   *
   * Turret angle/Player Angle.
   * Position.
   * Test Collision with World and bound World.
   *
   * @param {Array} Input - Input data like key pressed.
   * @param {World} World - World data.
   */
  updateOnInput (input: any, world: World): void {
    this.turretAngle = input[3]

    var haveCollision = false
    let tmpTestPos = [this.position[0], this.position[1]]
    var forwardPos = [this.position[0], this.position[1]]
    var someKeyIsPressed = false
    var testVelocity = [this.velocity[0], this.velocity[1]]

    if (this.speed > Constants.DEFAULT_SPEED) {
      this.speed -= 400
    } else {
      this.speed = Constants.DEFAULT_SPEED
    }

    if (input[12]) {
      this.canSpeed = false
      this.speed = Constants.DEFAULT_SPEED_MAX
      this.lastSpeedTime = (new Date()).getTime()
    }

    if (input[8]) {
      this.velocity[1] = -(input[8] * this.speed)
      testVelocity[1] = -(input[8] * this.speed) - 30
    } else if (input[11]) {
      this.velocity[1] = input[11] * this.speed
      testVelocity[1] = (input[8] * this.speed) + 30
    }

    if (input[9]) {
      this.velocity[0] = -(input[9] * this.speed)
      testVelocity[0] = -(input[8] * this.speed) - 30
    } else if (input[10]) {
      this.velocity[0] = input[10] * this.speed
      testVelocity[0] = (input[8] * this.speed) + 30
    }

    if (input[8] || input[10] || input[9] || input[11]) {
      someKeyIsPressed = true
    }

    if (!input[8] && !input[11]) {
      this.velocity[1] = 0
      testVelocity[1] = 0
    }

    if (!input[9] && !input[10]) {
      this.velocity[0] = 0
      testVelocity[0] = 0
    }

    this.velocity[0] *= this.friction
    this.velocity[1] *= this.friction

    testVelocity[0] *= this.friction
    testVelocity[1] *= this.friction

    forwardPos[0] += testVelocity[0]
    forwardPos[1] += testVelocity[1]

    tmpTestPos[0] += this.velocity[0]
    tmpTestPos[1] += this.velocity[1]

    haveCollision = world.checkCollider(this.position, forwardPos)

    if (tmpTestPos[0] >= 0 && tmpTestPos[0] <= Constants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[0] = tmpTestPos[0]
    }

    if (tmpTestPos[1] >= 0 && tmpTestPos[1] <= Constants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[1] = tmpTestPos[1]
    }

    if (someKeyIsPressed) {
      this.orientation = Math.atan2(forwardPos[1] - this.position[1], forwardPos[0] - this.position[0])
    }
  }

  /**
   * Player can shoot ?
   *
   * @return {Boolean} True if can, or false.
   */
  canShoot (): boolean {
    return (new Date()).getTime() > this.lastShotTime + this.shotCooldown && !this.death
  }

  /**
   * Player can speed ?
   *
   * @return {Boolean} True if can, or false.
   */
  canISpeed (): boolean {
    return (new Date()).getTime() > this.lastSpeedTime + this.speedCooldown && !this.death
  }

  /**
   * Test player coolide with other Entity.
   *
   * @param {Number} x          - Other entity X coord.
   * @param {Number} y          - Other entity Y coord.
   * @param {Number} hitboxSize - Other entity hitbox size.
   */
  isCollidedWith (x: number, y: number, hitboxSize: number): boolean {
    var minDistance = this.hitboxSize + hitboxSize
    return Util.getEuclideanDistance2(this.getX(), this.getY(), x, y) <
      (minDistance * minDistance)
  }

  /**
   * Decrease health by amount.
   *
   * If health < 0, player is death.
   *
   * @param {Number} amount - The damage player taken.
   */
  damage (amount: number): void {
    this.health -= amount

    if (this.health <= 0) {
      this.health = 0
      this.death = true
    }
  }
}
