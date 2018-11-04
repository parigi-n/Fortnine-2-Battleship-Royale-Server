const uuid = require('uuid/v1');

class Player {
  constructor(socket, userId, username) {
    this.socket = socket; // socket.io
    this.room = null;
    this.username = username;
    this.userId = userId;
  }

  setRoom(room) {
    this.room = room;
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username,
    };
  }
}

class Round {
  constructor(timeoutId) {
    this.playSignList = [];
    this.timeoutId = timeoutId;
  }

  playSign(playerIndex, sign) {
    this.playSignList[playerIndex] = sign;
  }

  getWinner() {
    if (this.playSignList.length === 0) { return null; }
    if (this.playSignList[0] === undefined && this.playSignList[1] !== undefined) { return 1; }
    if (this.playSignList[0] !== undefined && this.playSignList[1] === undefined) { return 0; }
    if (this.playSignList[0] === this.playSignList[1]) { return null; }
    if (this.playSignList[0] === 'rock') {
      if (this.playSignList[1] === 'paper') { return 1; }
      return 0;
    } if (this.playSignList[0] === 'paper') {
      if (this.playSignList[1] === 'scissors') { return 1; }
      return 0;
    } if (this.playSignList[0] === 'scissors') {
      if (this.playSignList[1] === 'rock') { return 1; }
      return 0;
    } return null;
  }

  havePlayerPlayed() {
    if (this.playSignList[0] !== undefined && this.playSignList[1] !== undefined) { return true; }
    return false;
  }
}

class Room {
  constructor(io, player, name) {
    this.name = name;
    this.id = uuid();
    this.io = io;
    this.state = 'lobby';
    this.roomOwner = player;
    this.playerList = [];
    this.roundList = [];
    this.config = {
      roundNumber: 3,
    };
    console.log(`New Room ${this.id} / ${this.name} created by ${player.username} (${player.userId})`);
    this.joinRoom(player);
  }

  joinRoom(player) {
    console.log(`Player ${player.username} (${player.userId}) joined room ${this.name}`);
    this.playerList.push(player);
    player.setRoom(this);
    player.socket.join(this.id, () => {
      player.socket.to(this.id).emit('playerJoined', player.toJSON());
      if (this.playerList.length === 2) {
        this.launchGame();
      }
    });
  }

  exitRoom(player) {
    console.log(`Player ${player.username} (${player.userId}) exited room ${this.name}`);
    player.socket.leave(this.id, () => {
      const playerIndex = this.playerList.indexOf(player);
      if (playerIndex !== -1) { this.playerList.splice(playerIndex, 1); }
      player.setRoom(null);
      this.io.in(this.id).emit('playerExit', player.toJSON());
      if (this.playerList.length === 1) {
        if (this.roundList.length > 0) {
          clearTimeout(this.roundList[this.roundList.length - 1].timeoutId);
        }
        this.io.in(this.id).emit('gameEnd', {
          winner: this.playerList[0].toJSON(),
        });
        this.state = 'lobby';
      }
    });
  }

  launchGame() {
    console.log(`Room ${this.name}: launching game`);
    this.roundList = [];
    this.state = 'playing';
    this.io.in(this.id).emit('gameStart', 'gameStart');
    this.launchRound();
  }

  launchRound() {
    console.log(`Room ${this.name}: launching round`);
    const timeoutId = setTimeout(() => { // <<<---    using ()=> syntax
      this.endRound();
    }, 15000);
    this.roundList.push(new Round(timeoutId));
    this.io.in(this.id).emit('roundStart', {
      duration: 15,
    });
  }

  endRound() {
    const currentRound = this.roundList[this.roundList.length - 1];
    clearTimeout(currentRound.timeoutId);
    const roundResult = currentRound.playSignList.map((playerSign, index) => ({
      player: this.playerList[index].toJSON(),
      sign: playerSign,
    }));
    console.log('roundResult', roundResult);
    const winnerIndex = currentRound.getWinner();
    if (winnerIndex === null) {
      console.log(`Room ${this.name}: ending round, draw !`);
      this.io.in(this.id).emit('roundEnd', {
        roundResult,
        winner: null,
      });
    } else {
      const winnerPlayer = this.playerList[winnerIndex];
      console.log(`Room ${this.name}: ending round, Winner is ${winnerPlayer.username} (${winnerPlayer.userId})`);
      this.io.in(this.id).emit('roundEnd', {
        roundResult,
        winner: winnerPlayer.toJSON(),
      });
    }
    if (this.roundList.length >= this.config.roundNumber) {
      const gameWinnerIndex = this.getGameWinner();
      if (gameWinnerIndex === null) {
        this.io.in(this.id).emit('gameEnd', {
          winner: null,
        });
      } else {
        this.io.in(this.id).emit('gameEnd', {
          winner: this.playerList[gameWinnerIndex].toJSON(),
        });
      }
      this.state = 'lobby';
    } else {
      this.launchRound();
    }
  }

  getGameWinner() {
    const winCount = [];
    winCount[0] = 0;
    winCount[1] = 0;
    this.roundList.forEach((round) => {
      const winnerIndex = round.getWinner();
      if (winnerIndex !== null) {
        winCount[winnerIndex] += 1;
      }
    });
    console.log('winCount', winCount);
    if (winCount[0] > winCount[1]) { return 0; }
    if (winCount[0] < winCount[1]) { return 1; }
    return null;
  }

  playSign(player, sign) {
    const currentRound = this.roundList[this.roundList.length - 1];
    currentRound.playSign(this.playerList.indexOf(player), sign);
    console.log(`Room ${this.name}: Player ${player.username} (${player.userId}) played sign ${sign}`);
    if (currentRound.havePlayerPlayed()) { this.endRound(); }
  }

  toJSON() {
    return {
      playerList: this.playerList,
      id: this.id,
      name: this.name,
      config: this.config,
      roomOwner: this.roomOwner,
      state: this.state,
    };
  }
}

module.exports = {
  Player,
  Room,
  Round,
};
