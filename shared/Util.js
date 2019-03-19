class Util {
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

  static randRange(min, max) {
    return (Math.random() * (max -min)) + min;
  }

  static inBound(val, min, max) {
    if (min > max) {
      return val >= max && val <= min;
    }

    return val >= min && val <= max;
  }

  static sqr(a) {
    return a * a;
  }

  static getEuclideanDistance2(x1, y1, x2, y2) {
    return ((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2));
  };

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
      if (Util.CollisionDroiteSeg(A,B,O,P)==false)
      return false;  // inutile d'aller plus loin si le segment [OP] ne touche pas la droite (AB)
      if (Util.CollisionDroiteSeg(O,P,A,B)==false)
         return false;
      return true;
    }

    static roughSizeOfObject( object ) {

        var objectList = [];
        var stack = [ object ];
        var bytes = 0;

        while ( stack.length ) {
            var value = stack.pop();

            if ( typeof value === 'boolean' ) {
                bytes += 4;
            }
            else if ( typeof value === 'string' ) {
                bytes += value.length * 2;
            }
            else if ( typeof value === 'number' ) {
                bytes += 8;
            }
            else if
            (
                typeof value === 'object'
                && objectList.indexOf( value ) === -1
            )
            {
                objectList.push( value );

                for( var i in value ) {
                    stack.push( value[ i ] );
                }
            }
        }
        return bytes;
    }

}

if (typeof module === 'object') {
  module.exports = Util;
}
