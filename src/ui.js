class UI {
  constructor(game) {
    this.game = game;

    this.messages = [];
  }

  displayTop(top) {
    document.querySelector('.end-game').style.display = 'block';
    document.querySelector('.end-game h1 span').innerHTML = top;
  }

  updateLeftPlayer(number) {
    document.querySelector('.in-game .alives span' ).innerHTML = number;
  }

  updateKill(number) {
    document.querySelector('.in-game .kills span' ).innerHTML = number;
  }

  addMessage(message) {
    this.messages.push(message);

    if ( this.messages.length > 4 ) {
      this.messages.splice(0, 1);
    }

    var output = '';

    for (var key in this.messages) {
      output += "<li>" + this.messages[key] + "</li>";
    }

    document.querySelector('.in-game .messages' ).innerHTML = output;

  }
}
