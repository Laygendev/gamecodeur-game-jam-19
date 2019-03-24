/**
 * @fileOverview Player class handle input, position, shoot cooldown, speed
 * cooldown and Damage taken.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedEntity = typeof module === 'object' ? require('./Entity') : Entity // eslint-disable-line
var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants // eslint-disable-line
var SharedUtil = typeof module === 'object' ? require( './Util') : Util // eslint-disable-line
var SharedWorld = typeof module === 'object' ? require( './World') : World // eslint-disable-line

/** Class representing a Player. */
class Player extends SharedEntity {
  /**
   * Initialise data
   *
   * @param {Array} position     - The position.
   * @param {Number} orientation - The degrees angle.
   * @param {String} name        - The name of the player.
   * @param {Number} id          - The socket ID.
   * @param {Object} screen      - The browser screen of the client.
   */
  constructor (position, orientation, name, id, screen) {
    super(position)

    /**
     * Setter position
     *
     * @type {Array}
     */
    this.position = position

    /**
     * Setter orientation
     *
     * @type {Number}
     */
    this.orientation = orientation

    /**
     * Setter name
     *
     * @type {String}
     */
    this.name = name

    /**
     * Setter ID
     *
     * @type {Number}
     */
    this.id = id

    /**
     * Setter screen
     *
     * @type {Object}
     */
    this.screen = screen

    /**
     * The turret angle (degrees)
     *
     * @type {Number}
     */
    this.turretAngle = orientation

    /**
     * The Vector velocity
     *
     * @type {Array}
     */
    this.velocity = [0, 0]

    /**
     * The friction for velocity calcul.
     *
     * @type {Number}
     */
    this.friction = 0.95

    /**
     * The speed of the player.
     *
     * @type {Number}
     */
    this.speed = SharedConstants.DEFAULT_SPEED

    /**
     * The timestamp of the last shoot.
     *
     * @type {Number}
     */
    this.lastShotTime = 0

    /**
     * The shotcoldown in MS.
     *
     * @type {Number}
     */
    this.shotCooldown = SharedConstants.DEFAULT_SHOT_COOLDOWN

    /**
     * The timestamp of the last speed action.
     *
     * @type {Number}
     */
    this.lastSpeedTime = 0

    /**
     * Can do speed action.
     *
     * @type {Boolean}
     */
    this.canSpeed = true

    /**
     * The speed cooldown in MS.
     *
     * @type {Number}
     */
    this.speedCooldown = SharedConstants.DEFAULT_SPEED_COOLDOWN

    /**
     * Count number of processed input for no make an applyInput already make.
     *
     * @type {Number}
     */
    this.lastProcessedInput = 0

    /**
     * A buffer of position for make interpolate client. Only used in client
     * side.
     *
     * @type {Array}
     */
    this.positionBuffer = []

    /**
     * Waiting message from server.
     *
     * @type {Boolean}
     */
    this.waitMessage = true

    /**
     * Size of hitbox
     *
     * @type {Number}
     */
    this.hitboxSize = SharedConstants.DEFAULT_HITBOX_SIZE

    /**
     * Health of player.
     *
     * @type {Number}
     */
    this.health = SharedConstants.PLAYER_MAX_HEALTH

    /**
     * Number kill of player.
     *
     * @type {Number}
     */
    this.kills = 0

    /**
     * Player is death ?
     *
     * @type {Boolean}
     */
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
  static generateNewPlayer (name, id, screen) {
    var point = SharedWorld.getRandomPoint()
    var orientation = SharedUtil.randRange(0, 2 * Math.PI)
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
  updateOnInput (input, world) {
    this.turretAngle = input[3]

    var haveCollision = false
    let tmpTestPos = [this.position[0], this.position[1]]
    var forwardPos = [this.position[0], this.position[1]]
    var someKeyIsPressed = false
    var testVelocity = [this.velocity[0], this.velocity[1]]

    if (this.speed > SharedConstants.DEFAULT_SPEED) {
      this.speed -= 100
    } else {
      this.speed = SharedConstants.DEFAULT_SPEED
    }

    if (input[12]) {
      this.canSpeed = false
      this.speed = SharedConstants.DEFAULT_SPEED_MAX
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

    if (tmpTestPos[0] >= 0 && tmpTestPos[0] <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
      this.position[0] = tmpTestPos[0]
    }

    if (tmpTestPos[1] >= 0 && tmpTestPos[1] <= SharedConstants.WORLD_MAX && someKeyIsPressed && !haveCollision) {
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
  canShoot () {
    return (new Date()).getTime() > this.lastShotTime + this.shotCooldown && !this.death
  }

  /**
   * Player can speed ?
   *
   * @return {Boolean} True if can, or false.
   */
  canISpeed () {
    return (new Date()).getTime() > this.lastSpeedTime + this.speedCooldown && !this.death
  }

  /**
   * Test player coolide with other Entity.
   *
   * @param {Number} x          - Other entity X coord.
   * @param {Number} y          - Other entity Y coord.
   * @param {Number} hitboxSize - Other entity hitbox size.
   */
  isCollidedWith (x, y, hitboxSize) {
    var minDistance = this.hitboxSize + hitboxSize
    return SharedUtil.getEuclideanDistance2(this.getX(), this.getY(), x, y) <
      (minDistance * minDistance)
  }

  /**
   * Decrease health by amount.
   *
   * If health < 0, player is death.
   *
   * @param {Number} amount - The damage player taken.
   */
  damage (amount) {
    this.health -= amount

    if (this.health <= 0) {
      this.health = 0
      this.death = true
    }
  }
}

if (typeof module === 'object') {
  module.exports = Player
}
