class Input {
    game;
    keyPressed;
    mousePosition;
    
    constructor(game) {
        this.game = game;
        
        this.keyPressed = {
            up: false,
            down: false,
            right: false,
            left: false,
        };
        
        this.mousePosition = {
            x: 0,
            y: 0
        };
        
        window.addEventListener('keydown', (e) => { this.keydown(e); }, false);
        window.addEventListener('keyup', (e) => { this.keyup(e); }, false);
        window.addEventListener('mousemove', (e) => { this.mousemove(e) }, false);
    }
    
    keydown(e) {
        var code = e.keyCode;
        
        switch (code) {
            case 38:
                this.keyPressed.up = true;
                break;
            case 40:
                this.keyPressed.down = true;
                break;
            case 39:
                this.keyPressed.right = true;
                break;
            case 37:
                this.keyPressed.left = true;
                break;
        }
    }
    
    keyup(e) {
        var code = e.keyCode;
        
        switch (code) {
            case 38:
                this.keyPressed.up = false;
                break;
            case 40:
                this.keyPressed.down = false;
                break;
            case 39:
                this.keyPressed.right = false;
                break;
            case 37:
                this.keyPressed.left = false;
                break;
        }
    }
    
    mousemove(e) {
        let rect = this.game.canvas.getBoundingClientRect();
        
        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
    }
}