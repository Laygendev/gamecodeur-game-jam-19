class Loader {
    constructor(game) {
        this.game             = game;
        this.ressourcesToLoad = [];
        this.isLoaded         = false;
        this.nbLoad           = 0;
    }

    loadImage(id, path) {
        this.ressourcesToLoad[id] = {
          path: path,
          type: 'image'
        };
    }

    loadJSON(id, path) {
        this.ressourcesToLoad[id] = {
          path: path,
          type: 'json'
        };
    }

    start() {
        for (var key in this.ressourcesToLoad) {
          if (this.ressourcesToLoad[key].type == 'image') {
            this.game.ressources[key] = new Image();
            this.game.ressources[key].addEventListener('load', () => {
              this.nbLoad++;
              this.checkAllLoad();
            });

            this.game.ressources[key].src = this.ressourcesToLoad[key].path;
          } else if (this.ressourcesToLoad[key].type == 'json') {
            this.game.ressources[key] = {};

            xhrJSON.loadJSON(this.ressourcesToLoad[key].path, (text) => {
              this.game.ressources[key] = JSON.parse(text);
              this.nbLoad++;
              this.checkAllLoad();
            });
          }

          this.game.ressources[key].isLoaded = false;
        }
    }

    checkAllLoad() {
      if (this.nbLoad == Util.length(this.ressourcesToLoad)) {
        this.isLoaded = true;
        // this.game.net = new Net(this.game);
      }
    }
}
