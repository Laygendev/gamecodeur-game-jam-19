const Constants = {
  WORLD_MIN: 0,
  WORLD_MAX: 2000,
  DEFAULT_SHOT_COOLDOWN: 100,
  DEFAULT_HITBOX_SIZE: 30,
  BULLET_HITBOX_SIZE: 10,
  PLAYER_MAX_HEALTH: 5,
  DEFAULT_TIME_TO_START_ROOM: 10000
};

if (typeof module === 'object') {
  module.exports = Constants;
}
