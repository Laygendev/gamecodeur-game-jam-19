const Constants = {
  WORLD_MIN: 0,
  WORLD_MAX: 5000,
  VISIBILITY_TRESHOLD_X: 425,
  VISIBILITY_TRESHOLD_Y: 325
};

if (typeof module === 'object') {
  module.exports = Constants;
} else {
  window.util = Constants;
}
