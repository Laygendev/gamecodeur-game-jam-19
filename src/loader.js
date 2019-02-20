class Loader {
    game;

    ressourcesToLoad;
    
    isLoaded;
    constructor(game) {
        this.game             = game;
        this.ressourcesToLoad = [];
        this.isLoaded         = false;
    }
    
    load(id, path) {
        this.ressourcesToLoad[id] = path;
    }
    
    start() {
        for (var key in this.ressourcesToLoad) {
            this.game.ressources[key] = new Image();
            this.game.ressources[key].addEventListener('load', () => {
                this.checkAllLoad();
            });
            
            this.game.ressources[key].src = this.ressourcesToLoad[key];
        }
    }
    
    checkAllLoad() {
        if(this.game.ressources.length == this.ressourcesToLoad.length) {
            this.isLoaded = true;
            this.game.start();
        }
    }
}