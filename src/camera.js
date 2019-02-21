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
        this.x      = 0;
        this.y      = 0;
        this.game   = game;
        this.width  = game.canvas.width;
        this.height = game.canvas.height;
        this.speed  = 1;
    }
    
    setTarget(target) {
        this.target = target;
    }
    
    beforeUpdate() {
        
    }
    
    afterUpdate() {
        
    }
}