/**
 * @fileOverview Define constants used by Server and Client.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/**
 * Object of all shared constant
 *
 * @namespace
 *
 */
var Constants = {}

/**
 * Define min size of World
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.WORLD_MIN = 0

/**
 * Define max size of World
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.WORLD_MAX = 40000

/**
 * Define the default shoot coldown
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_SHOT_COOLDOWN = 100

/**
 * Define the default speed coldown
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_SPEED_COOLDOWN = 2000

/**
 * Define the default hitbox size
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_HITBOX_SIZE = 30

/**
 * Define the default bullet hitbox size
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.BULLET_HITBOX_SIZE = 10

/**
 * Define the default player max health
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.PLAYER_MAX_HEALTH = 5

/**
 * Define the default player speed
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_SPEED = 300

/**
 * Define the default player max speed
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_SPEED_MAX = 20000

/**
 * Define the default start room time
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_TIME_TO_START_ROOM = 10000

/**
 * Define the default room max player
 *
 * @memberof Constants
 *
 * @type {Number}
 */
Constants.DEFAULT_ROOM_MAX_PLAYER = 30

if (typeof module === 'object') {
  module.exports = Constants
}
