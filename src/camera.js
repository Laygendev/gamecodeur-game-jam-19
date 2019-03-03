class Camera {
    constructor(game) {
      this.game      = game;
        this.x         = 0;
        this.y         = 0;
        this.width     = this.game.canvas.width;
        this.height    = this.game.canvas.height;
        this.maxX      = 0;
        this.maxY      = 0;
        this.xDeadZone = 0;
        this.yDeadZone = 0;
        this.target    = null;
        this.viewportRect   = new Rectangle(this.x, this.y, this.width, this.height);
        this.worldRect      = null;
    }

    setTarget(target, xDeadZone, yDeadZone) {
        this.target    = target;
        this.xDeadZone = xDeadZone;
        this.yDeadZone = yDeadZone;

        this.worldRect = new Rectangle(0, 0, this.game.width, this.game.height);
    }

    update() {
      if (this.target != null && this.worldRect != null) {
        if(this.target.pos.x - this.x + this.xDeadZone > this.game.canvas.width)
            this.x = this.target.pos.x - (this.game.canvas.width - this.xDeadZone);
        else if(this.target.pos.x - this.xDeadZone < this.x)
            this.x = this.target.pos.x  - this.xDeadZone;

        if(this.target.pos.y - this.y + this.yDeadZone > this.game.canvas.height)
            this.y = this.target.pos.y - (this.game.canvas.height - this.yDeadZone);
        else if(this.target.pos.y - this.yDeadZone < this.y)
            this.y = this.target.pos.y - this.yDeadZone;

      this.viewportRect.set(this.x, this.y);
        // don't let camera leaves the world's boundary
        if(!this.viewportRect.within(this.worldRect))
        {
          if(this.viewportRect.left < this.worldRect.left)
            this.x = this.worldRect.left;
          if(this.viewportRect.top < this.worldRect.top)
            this.y = this.worldRect.top;
          if(this.viewportRect.right > this.worldRect.right)
            this.x = this.worldRect.right - this.width;
          if(this.viewportRect.bottom > this.worldRect.bottom)
            this.y = this.worldRect.bottom - this.height;
        }
      }
    }

    inViewport(x, y) {
      if (x + 80 >= this.x && x + 80 <= this.x + this.viewportRect.width + 80
      && y + 80 >= this.y && y + 80 <= this.y + this.viewportRect.height + 80) {
        return true;
      }

      return false;
    }
}
