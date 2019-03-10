class Input {
    constructor(game) {
        this.game = game;

        this.keyPressed = {
            up: false,
            down: false,
            right: false,
            left: false,
            space: false,
            Z: false,
            Q: false,
            S: false,
            D: false
        };

        this.mousePosition = {
            x: 0,
            y: 0
        };

        this.leftClickPressed = false;

        window.addEventListener('keydown', (e) => { this.keydown(e); }, false);
        window.addEventListener('keyup', (e) => { this.keyup(e); }, false);
        window.addEventListener('mousemove', (e) => { this.mousemove(e) }, false);
        window.addEventListener('mousedown', (e) => { this.mousedown(e) }, false);
        window.addEventListener('mouseup', (e) => { this.mouseup(e) }, false);
        window.addEventListener('resize', (e) => { this.resizeCanvas(e); }, false);
    }

    keydown(e) {
        var code = e.keyCode;

        switch (code) {
            case 32:
              this.keyPressed.space = true;
                break;
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
            case 81: // Q
              this.keyPressed.Q = true;
              break;
            case 83: // S
              this.keyPressed.S = true;
              break;
            case 90: // Z
              this.keyPressed.Z = true;
              break;
            case 68: // D
              this.keyPressed.D = true;
              break;
        }
    }

    keyup(e) {
        var code = e.keyCode;

        switch (code) {
          case 32:
            this.keyPressed.space = false;
              break;
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
            case 81: // Q
              this.keyPressed.Q = false;
              break;
            case 83: // S
              this.keyPressed.S = false;
              break;
            case 90: // Z
              this.keyPressed.Z = false;
              break;
            case 68: // D
              this.keyPressed.D = false;
              break;
        }
    }

    mousemove(e) {
        let rect = this.game.canvas.getBoundingClientRect();

        this.mousePosition.x = e.clientX - rect.left;
        this.mousePosition.y = e.clientY - rect.top;
    }

    mousedown(e) {
      if (e.which == 1) {
        this.leftClickPressed = true;
      }
    }

    mouseup(e) {
      if (e.which == 1) {
        this.leftClickPressed = false;
      }
    }

    resizeCanvas(e) {
      this.game.canvas.width               = window.innerWidth;
      this.game.canvas.height              = window.innerHeight;
      this.game.camera.width               = this.game.canvas.width;
      this.game.camera.xDeadZone           = this.game.canvas.width / 2;
      this.game.camera.yDeadZone           = this.game.canvas.height / 2;
      this.game.camera.viewportRect.width  = this.game.canvas.width;
      this.game.camera.viewportRect.height = this.game.canvas.height;
    }
}
