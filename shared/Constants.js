const Constants = {
  WORLD_MIN: 0,
  WORLD_MAX: 5000,
  DEFAULT_SHOT_COOLDOWN: 800,
  DEFAULT_HITBOX_SIZE: 30,
  BULLET_HITBOX_SIZE: 10,
  PLAYER_MAX_HEALTH: 5
};

if (typeof module === 'object') {
  module.exports = Constants;
}
