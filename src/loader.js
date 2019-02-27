class Loader {
    game;

    ressourcesToLoad;
    nbLoad;

    isLoaded;
    constructor(game) {
        this.game             = game;
        this.ressourcesToLoad = [];
        this.isLoaded         = false;
        this.nbLoad           = 0;
    }

    load(id, path) {
        this.ressourcesToLoad[id] = path;
    }

    start() {
        for (var key in this.ressourcesToLoad) {
            this.game.ressources[key] = new Image();
            this.game.ressources[key].addEventListener('load', () => {
              this.nbLoad++;
              this.checkAllLoad();
            });

            this.game.ressources[key].src = this.ressourcesToLoad[key];
            this.game.ressources[key].isLoaded = false;
        }
    }

    checkAllLoad() {
      if (this.nbLoad == Util.length(this.ressourcesToLoad)) {
        this.isLoaded = true;
        this.game.net = new Net(this.game);
      }
    }
}
