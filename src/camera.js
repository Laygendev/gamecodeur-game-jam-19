class Camera {
    game;
    x;
    y;
    width;
    height;
    maxX;
    maxY;
    target;
    speed;

    constructor(game) {
        this.x         = 0;
        this.y         = 0;
        this.game      = game;
        this.xDeadZone = 0;
        this.yDeadZone = 0;
        this.width     = game.canvas.width;
        this.height    = game.canvas.height;
        this.target    = null;
    }

    setTarget(target, xDeadZone, yDeadZone) {
        this.target    = target;
        this.xDeadZone = xDeadZone;
        this.yDeadZone = yDeadZone;
    }

    update() {
      if (this.target != null) {
        if(this.target.pos.x - this.x  + this.xDeadZone > this.width)
            this.x = this.target.pos.x - (this.width - this.xDeadZone);
        else if(this.target.pos.x  - this.xDeadZone < this.x)
            this.x = this.target.pos.x  - this.xDeadZone;

        if(this.target.pos.y - this.y + this.yDeadZone > this.height)
            this.y = this.target.pos.y - (this.height - this.yDeadZone);
        else if(this.target.pos.y - this.yDeadZone < this.y)
            this.y = this.target.pos.y - this.yDeadZone;
      }
    }
}
