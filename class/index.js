const uuid = require('uuid/v1');

class Player {
  constructor(socket, userId, username) {
    this.socket = socket; //socket.io
    this.room = null;
    this.username = username;
    this.userId = userId;
  }

  toJSON() {
    return {
      userId: this.userId,
      username: this.username
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
    if (this.playSignList.length === 0)
      return null;
    else if (this.playSignList[0] === undefined && this.playSignList[1] !== undefined)
      return 1;
    else if (this.playSignList[0] !== undefined && this.playSignList[1] === undefined)
      return 0;
    else if (this.playSignList[0] === this.playSignList[1])
      return null;
    else if (this.playSignList[0] === "rock") {
      if (this.playSignList[1] === "paper")
        return 1;
      else
        return 0;
    } else if (this.playSignList[0] === "paper") {
      if (this.playSignList[1] === "scissors")
        return 1;
      else
        return 0;
    } else if (this.playSignList[0] === "scissors") {
      if (this.playSignList[1] === "rock")
        return 1;
      else
        return 0;
    } else
      return null;
  }

  havePlayerPlayed() {
    if (this.playSignList[0] !== undefined && this.playSignList[1] !== undefined)
      return true;
    else
      return false;
  }
}

class Room {
  constructor(io, player, name) {
    this.name = name;
    this.id = uuid();
    this.io = io;
    this.state = "lobby";
    this.roomOwner = player;
    this.playerList = [];
    this.roundList = [];
    this.config = {
      roundNumber: 1
    }
    console.log(`New Room ${this.id} / ${this.name} created by ${player.username} (${player.userId})`)
    this.joinRoom(player);
  }

  joinRoom(player) {
    console.log(`Player ${player.username} (${player.userId}) joined room ${this.name}`)
    this.playerList.push(player);
    player.room = this;
    player.socket.join(this.id, () => {
      player.socket.to(this.id).emit('playerJoined', player.toJSON());
      if (this.playerList.length === 2) {
        this.launchGame();
      }
    });
  }

  launchGame() {
    console.log(`Room ${this.name}: launching game`);
    this.roundList = [];
    this.state = "playing";
    this.io.in(this.id).emit('gameStart', 'gameStart');
    this.launchRound();
  }

  launchRound() {
    console.log(`Room ${this.name}: launching round`);
    const timeoutId = setTimeout(() => { //<<<---    using ()=> syntax
      this.endRound();
    }, 15000);
    this.roundList.push(new Round(timeoutId));
    this.io.in(this.id).emit('roundStart', 'roundStart');
  }

  endRound() {
    const currentRound = this.roundList[this.roundList.length - 1];
    clearTimeout(currentRound.timeoutId);
    const roundResult = currentRound.playSignList.map((playerSign, index) => {
      return {
        player: this.playerList[index].toJSON(),
        sign: playerSign
      }
    });
    console.log("roundResult", roundResult);
    const winnerIndex = currentRound.getWinner();
    if (winnerIndex === null) {
      console.log(`Room ${this.name}: ending round, draw !`);
      this.io.in(this.id).emit('roundEnd', {
        roundResult: roundResult,
        winner: null
      });
    } else {
      const winnerPlayer = this.playerList[winnerIndex];
      console.log(`Room ${this.name}: ending round, Winner is ${winnerPlayer.username} (${winnerPlayer.userId})`);
      this.io.in(this.id).emit('roundEnd', {
        roundResult: roundResult,
        winner: winnerPlayer.toJSON()
      });
    }
    if (this.roundList.length >= this.config.roundNumber) {
      const gameWinnerIndex = this.getGameWinner();
      if (gameWinnerIndex === null)
        this.io.in(this.id).emit('gameEnd', {winner: null});
      else
        this.io.in(this.id).emit('gameEnd', {winner: this.playerList[gameWinnerIndex].toJSON()});
      this.state = "lobby";
    } else {
      launchRound();
    }
  }

  getGameWinner() {
    const winCount = [];
    winCount[0] = 0;
    winCount[1] = 0;
    this.roundList.forEach(function(round) {
      const winnerIndex = round.getWinner();
      if (winnerIndex !== null)
        winCount[winnerIndex]++;
    });
    console.log("winCount", winCount)
    if (winCount[0] > winCount[1])
      return 0;
    else if (winCount[0] < winCount[1])
      return 1;
    else
      return null;
  }

  playSign(player, sign) {
    const currentRound = this.roundList[this.roundList.length - 1];
    currentRound.playSign(this.playerList.indexOf(player), sign);
    console.log(`Room ${this.name}: Player ${player.username} (${player.userId}) played sign ${sign}`);
    if (currentRound.havePlayerPlayed())
      this.endRound();
  }

  toJSON() {
    return {
      playerList: this.playerList,
      id: this.id,
      name: this.name,
      config: this.config,
      roomOwner: this.roomOwner,
      state: this.state
    };
  }
}

module.exports = {
  Player,
  Room,
  Round
};
