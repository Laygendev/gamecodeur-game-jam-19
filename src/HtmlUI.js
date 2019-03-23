class htmlUI {
  constructor(game, socket) {
    this.game = game;
    this.socket = socket;
    this.isLookingForRoom = false;

    this.messages = [];

    this.socket.on('connected', (id) => { this.displayConnected(id); });

    this.socket.on('connect_error', () => {
       if (document.querySelector(".in-game").style.display == 'block') {
           document.querySelector(".menu").style.display = "block";
           document.querySelector(".in-game").style.display = 'none';
           document.querySelector(".network-ready .state").innerHTML = "Press enter to looking for a game";
           this.game.stop();
       }

       document.querySelector(".network-ready").style.display = 'none';
       document.querySelector(".network-not-ready").style.display = 'block';

       document.querySelector(".network-not-ready").innerHTML = "Server offline";
   });

    this.socket.on('reconnecting', (n) => {
      document.querySelector(".network-not-ready").innerHTML = "Try reconnecting #" + n;
    });

    window.addEventListener('keydown', (e) => { this.lookingForRoom(e); });
    document.querySelector('.back').addEventListener('click', (e) => { this.backToMenu() });
    document.querySelector('.start-game').addEventListener('click', (e) => { this.askToStart(); } );
  }

  displayConnected(id) {
    this.game.id = id;

    document.querySelector(".network-ready").style.display = 'block';
    document.querySelector(".network-not-ready").style.display = 'none';
  }

  lookingForRoom(e) {
    var code = e.keyCode;

    if (13 === code) {
      if (!this.isLookingForRoom) {
        var name = document.querySelector(".name").value;

        if (name && name.length < 20) {
          this.isLookingForRoom = true;
          console.log(this.game.canvas.width);
          this.socket.emit('join-room', {
            name: name,
            screen: {
              w: this.game.canvas.width,
              h: this.game.canvas.height,
              hW: this.game.canvas.width / 2,
              hH: this.game.canvas.height / 2
            }
          });
        } else {
          window.alert('Your name cannot be blank or over 20 characters.');
        }
      }
    }
  }

  backToMenu() {
    this.messages = [];
    this.updateLeftPlayer(0);
    this.updateKill(0);

    document.querySelector(".in-game").style.display = 'none';
    document.querySelector('.end-game').style.display = 'none';
    document.querySelector(".menu").style.display = "block";
    document.querySelector(".network-ready .state").innerHTML = "Press enter to looking for a game";
    this.socket.emit('leave-room');
    document.querySelector('.in-game .messages' ).innerHTML = "";

    this.game.stop();
  }

  askToStart() {
    this.socket.emit('room-ask-to-start');

    document.querySelector('.start-game').style.display = "none";
  }

  updateTimeToStart(message) {
    document.querySelector('.top-center .message').innerHTML = message;
  }

  hideStartMessage() {
    document.querySelector('.top-center' ).style.display = "none";
  }

  switchUI() {
    document.querySelector(".menu").style.display = "none";
    document.querySelector(".in-game").style.display = "block";
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
    if (document.querySelector(".in-game").style.display == 'block') {
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

  reset() {
    document.querySelector('.in-game .alives span' ).innerHTML = 0;
    document.querySelector('.in-game .kills span' ).innerHTML  = 0;

    this.messages = [];
    document.querySelector('.in-game .messages' ).innerHTML = "";
  }
}
