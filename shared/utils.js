class Utils {
  static degreesToRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi/180);
  }

  static radiansToDegrees(radians) {
    var pi = Math.PI;
    return radians * (180/pi);
  }

  static length(obj) {
      return Object.keys(obj).length;
  }
}

if (module) {
  module.exports = Utils;
}
