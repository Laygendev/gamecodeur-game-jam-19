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

  static OBB(tab, P) {
      for (var i = 0; i < 4; i++) {
          var A = tab[i].pos;
          var B;
    		if (i == 3) {
    			B = tab[0].pos
    		} else {
              B = tab[i + 1].pos;
          }
    		var D = {X: 0, Y: 0};
    		var T = {X: 0, Y: 0};

    		D.X = B.x - A.x;
    		D.Y = B.y - A.y;
    		T.X = P.x - A.x;
    		T.Y = P.y - A.y;
    		var d = D.X*T.Y - D.Y*T.X;
    		if (d > 0) {
    			return false;
    		}
      }

      return true;
    }
}

if (module) {
  module.exports = Utils;
}
