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
      for (var i = 0; i < tab.length; i++) {
          var A = tab[i];
          var B;
    		if (i == tab.length - 1) {
    			B = tab[0]
    		} else {
              B = tab[i + 1];
          }
    		var D = {X: 0, Y: 0};
    		var T = {X: 0, Y: 0};

    		D.X = B.x - A.x;
    		D.Y = B.y - A.y;
    		T.X = P.pos.x - A.x;
    		T.Y = P.pos.y - A.y;
    		var d = D.X*T.Y - D.Y*T.X;
    		if (d > 0) {
    			return false;
    		}
      }

      return true;
    }

    static CollisionDroiteSeg(A, B, O, P) {
      var AO = {x: 0, y: 0};
      var AP = {x: 0, y: 0};
      var AB = {x: 0, y: 0};

      AB.x = B.x - A.x;
      AB.y = B.y - A.y;
      AP.x = P.x - A.x;
      AP.y = P.y - A.y;
      AO.x = O.x - A.x;
      AO.y = O.y - A.y;

      if ((AB.x*AP.y - AB.y*AP.x)*(AB.x*AO.y - AB.y*AO.x)<0)
        return true;
      else
        return false;
    }

    static CollisionSegSeg(A, B, O, P) {
      if (Utils.CollisionDroiteSeg(A,B,O,P)==false)
      return false;  // inutile d'aller plus loin si le segment [OP] ne touche pas la droite (AB)
      if (Utils.CollisionDroiteSeg(O,P,A,B)==false)
         return false;
      return true;
    }
}

if (module) {
  module.exports = Utils;
}
