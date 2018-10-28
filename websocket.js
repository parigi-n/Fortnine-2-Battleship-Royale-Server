const socketio = require('socket.io')();
const io = socketio.listen(4242);
const jwt = require('jsonwebtoken');
const api = require('./helpers/sequelizeHelper');
const {
  Player,
  Room,
  Round
} = require('./class');

const roomList = [];

console.log(`Socket.io listening on port 4242`)
io.use(function(socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, 'NeverShareYourSecret', function(err, decoded) {
      if (err) return next(new Error('Authentication error'));
      socket.decoded = decoded;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});
io.on('connection', async function(socket) {
  const response = await api.users.one(socket.decoded.userId);
  const player = new Player(socket, response.id, response.username);
  console.log(`Player ${player.username} (${player.userId}) connected`)
  socket.on('joinRoom', (data, callback) => {
    const roomResult = roomList.find(room => {
      return (room.id === data.id)
    });
    if (!roomResult) {
      callback({
        success: false,
        message: "Room not find"
      });
    } else if (roomResult.playerList.length >= 2) {
      callback({
        success: false,
        message: "Room is full"
      });
    } else {
      roomResult.joinRoom(player);
      callback({
        success: true
      });
    }
  });
  socket.on('createRoom', (data, callback) => {
    const newRoom = new Room(io, player, data.name);
    roomList.push(newRoom);
    callback({
      success: true
    });
  });

  socket.on('playSign', (data, callback) => {
    if (data.sign && (data.sign === "rock" || data.sign === "paper" || data.sign === "scissors")) {
      player.room.playSign(player, data.sign);
      callback({
        success: true
      });
    } else {
      callback({
        success: false
      });
    }
  });

  socket.on('message', (data, callback) => {
    console.log(data);
    callback({
      success: true
    });
  });

  socket.emit('ready');
});

module.exports = {
  io,
  roomList
};
