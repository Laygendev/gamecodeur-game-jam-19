/**
 * @fileOverview Bullet class manage the state of all projectiles.
 *
 * @author BwooGames
 * @version 0.1.0
 */

const Entity = require('./Entity')
const Constants = require('./Constants')

/** Class represening a bullet. */
class Bullet extends Entity {
  /**
   * Create a bullet.
   *
   * Init all properties needed from the bullet Object.
   *
   * @param {Array} position - The position of bullet
   * @param {Server} angle    - The degrees angle.
   * @param {Number} playerID - The owner ID of this bullet.
   */
  constructor (position, angle, playerID) {
    super(position)

    /**
     * The position.
     *
     * @type {Array}
     */
    this.position = position

    /**
     * The degrees angle.
     *
     * @type {Number}
     */
    this.angle = angle

    /**
     * The owner ID.
     *
     * @type {Number}
     */
    this.playerID = playerID

    /**
     * The init position.
     * JSON.parse and JSON.stringify for copy the array and not make a
     * reference to it.
     *
     * @type {Number}
     */
    this.initPos = JSON.parse(JSON.stringify(position))

    /**
     * Speed.
     *
     * @type {Number}
     */
    this.speed = 1500

    /**
     * Distance before delete it.
     *
     * @type {Number}
     */
    this.distanceMax = 800

    /**
     * Need to be deleted or ot.
     *
     * @type {Boolean}
     */
    this.needToDeleted = false
  }

  /**
   * Update the position of the bullet.
   * Check the distance between initPos and position for now if we need
   * to delete it or not.
   *
   * Check collision with each player. If it collide, make damage to player,
   * and destroy the bullet.
   *
   * @param {Room} room       - The room of this bullet.
   * @param {HashMap} clients - The collections of client.
   * @param {Number} dt       - The timestamp for update position.
   *
   * @return {Object}            Info of collide. KillingPlayer and
   * killedPlayer.
   */
  update (room, clients, dt) {
    if (!this.needToDeleted) {
      this.position[0] += this.speed * Math.cos(this.angle) * dt
      this.position[1] += this.speed * Math.sin(this.angle) * dt

      var dist = Math.sqrt(Math.pow((this.initPos[0] - this.position[0]), 2) + Math.pow((this.initPos[1] - this.position[1]), 2))
      if (dist >= this.distanceMax) {
        this.needToDeleted = true
      }
    }

    var players = clients.values()
    for (var i = 0; i < players.length; ++i) {
      if (this.playerID !== players[i].id && !players[i].death &&
          players[i].isCollidedWith(this.getX(), this.getY(), Constants.BULLET_HITBOX_SIZE)) {
        var killingPlayer = null

        if (room.isStarted) {
          players[i].damage(1)
        }

        room.server.io.to(room.id).emit('room-update-ui', { hit: {
          position: players[i].position
        } })

        if (players[i].death) {
          killingPlayer = clients.get(this.playerID)
          killingPlayer.kills++
        }

        this.needToDeleted = true
        return {
          hitPlayer: players[i],
          killingPlayer: killingPlayer
        }
      }
    }
  }
}

module.exports = Bullet
