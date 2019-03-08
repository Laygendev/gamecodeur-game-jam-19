class htmlUI {
  constructor(game) {
    this.game = game;

    this.messages = [];

    document.querySelector('.start-vote').addEventListener('click', (e) => { this.startVote(); });
    document.querySelector('.vote-yes').addEventListener('click', (e) => { this.vote(true); });
    document.querySelector('.vote-no').addEventListener('click', (e) => { this.vote(false); });
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

  startVote() {
    this.game.net.socket.emit('startVote', {
      id: this.game.net.id,
      roomID: this.game.net.room.id
    });

    document.querySelector(".vote").style.display = "block;"
    document.querySelector( '.buttons-vote' ).style.display = "none";
  }

  vote(ok) {
    document.querySelector( '.buttons-vote' ).style.display = "none";
    this.game.net.socket.emit('vote', {
      ok: ok,
      id: this.game.net.id,
      roomID: this.game.net.room.id
    });
  }

  updateRoomVote(data) {
    var output = '';

    if (data.length >= 0) {
      document.querySelector(".vote .start-vote").style.display = "none";
      document.querySelector(".vote .bloc").style.display = "block";

      for (var i = 0; i < data.length; ++i) {
        var elementClass = '';

        if (data[i].ok == true) {
          elementClass = 'green';
        } else if (data[i].ok == false) {
          elementClass = 'red';
        }

        output += "<li><i class='" + elementClass + " fas fa-circle'></i></li>";
      }
    } else {
      document.querySelector(".vote .start-vote").style.display = "block";
      document.querySelector(".vote .bloc").style.display = "none";
    }

    document.querySelector(".vote .bloc .votes").innerHTML = output;

  }

  resetVote() {
    document.querySelector(".vote").style.display = "none";
    document.querySelector( '.buttons-vote' ).style.display = "block";
    document.querySelector(".vote .start-vote").style.display = "block";
    document.querySelector(".vote .bloc").style.display = "none";
    document.querySelector(".vote .bloc .votes").innerHTML = '';

  }

  reset() {
    document.querySelector('.in-game .alives span' ).innerHTML = 0;
    document.querySelector('.in-game .kills span' ).innerHTML  = 0;

    this.messages = [];
    document.querySelector('.in-game .messages' ).innerHTML = "";
  }
}
