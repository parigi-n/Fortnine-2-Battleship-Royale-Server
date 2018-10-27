class Player {
  constructor(ws) {
    this.ws = ws; //websocket
    this.room = null;
  }

  get ws() {
    return this.ws;
  }

  setRoom(room) {
    this.room = room;
  }
}

class Room {
  constructor(player, userId) {
    this.playerList = [];
    this.playerList.push(player);
    this.userId = userId;
  }

  get playerList() {
    return this.playerList;
  }
}

module.exports = {
    Player,
    Room
};
