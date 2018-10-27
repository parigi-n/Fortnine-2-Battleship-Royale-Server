class Player {
  constructor(ws, userId) {
    this.ws = ws; //websocket
    this.room = null;
  }

  get ws() {
    return this.ws;
  }

  setRoom(room) {
    this.room = room;
  }

  get room() {
    return this.room;
  }

  toJSON() {
    return {
      id: this.userId
    };
  }
}

class Room {
  constructor(player, name) {
    this.playerList = [];
    this.playerList.push(player);
    this.uuid = uuid();
    this.name = name;
    this.board = [];
  }

  get playerList() {
    return this.playerList;
  }

  toJSON() {
    return {
      playerList: this.playerList,
      id: this.uuid,
      name: this.name
    };
  }
}

class Ship {
  constructor(coordinateList) {
    this.coordinateList = coordinateList;
    this.shotCoordinateList = [];
  }

  shoot(coordinate) {
    const coordinateResult = this.coordinateList.find(coordinateListElement => {
      return (coordinateListElement.x === coordinate.x && coordinateListElement.y === coordinate.y)
    });
    if (coordinateResult === undefined)
      return false;
    else {
      const shotCoordinateResult = this.shotCoordinateList.find(shotCoordinateListElement => {
        return (shotCoordinateListElement.x === coordinateResult.x && shotCoordinateListElement.y === coordinateResult.y)
      });
      if (shotCoordinateResult === undefined) {
        this.shotCoordinateList.push(coordinate)
        return true
      } else {
        return false;
      }
    }
  }

  get isDead() {
    return this.coordinateList.length === this.shotCoordinateList.length;
  }
}

const roomList = [];

const socketio = require('socket.io')();
const io = socketio.listen(4242);
const jwt = require('jsonwebtoken');
const uuid = require('uuid/v1');

io.use(function(socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    /*jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });*/
    console.log(socket.handshake.query.token);
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
io.on('connection', function(socket) {
  const board = [];
  let Room = null;

  console.log(socket.handshake.query.token);
  socket.on('joinRoom', function(data, callback) {
    const roomResult = this.roomList.find(room => {
      return (room.id === data.roomId)
    });
    if (roomResult && roomResult.playerList.length < 2) {
      roomResult.playerList.push(player);
    if (roomResult && roomResult.playerList.length == 2) {

      roomResult.launchGame
        callback({
        success: true
      });
    } else {
      callback({
        success: false
      });
    }
  });
  socket.on('createRoom', function(data, callback) {
    const newRoom = new Room(player, data.roomName);
    this.Room = newRoom;
    roomList.push(newRoom);
    player.setRoom(newRoom);
    callback({
      success: true
    });
  });

  socket.on('shoot', function(data, callback) {
    const newRoom = new Room(player, data.roomName);
    roomList.push(newRoom);
    player.setRoom(newRoom);
    callback({
      success: true
    });
  });
  socket.on('message', function(data, callback) {
    console.log(data);
    callback({
      success: true
    });
  });
});

const ship = {
  test: 42
};
const board = [];
for (let i = 0; i < 10; i++) {
  board[i] = [];
  for (let j = 0; j < 10; j++) {
    board[i][j] = new Ship([{
      x: 2,
      y: 3
    }, {
      x: 2,
      y: 4
    }, {
      x: 2,
      y: 5
    }]);
  }
}
