const socketio = require('socket.io')();

const io = socketio.listen(4242);
const jwt = require('jsonwebtoken');
const api = require('./helpers/sequelizeHelper');
const { Player, Room } = require('./class');

const roomList = [];

console.log('Socket.io listening on port 4242');
io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, 'NeverShareYourSecret', (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.decoded = decoded; // eslint-disable-line no-param-reassign
      return next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});
io.on('connection', async (socket) => {
  const response = await api.users.one(socket.decoded.userId);
  const player = new Player(socket, response.id, response.username);
  console.log(`Player ${player.username} (${player.userId}) connected`);

  socket.on('joinRoom', (data, callback) => {
    const roomResult = roomList.find(room => room.id === data.id);
    if (!roomResult) {
      callback({
        success: false,
        message: 'Room not find',
      });
    } else if (roomResult.playerList.length >= 2) {
      callback({
        success: false,
        message: 'Room is full',
      });
    } else {
      roomResult.joinRoom(player);
      callback({
        success: true,
        room: roomResult.toJSON(),
      });
    }
  });
  socket.on('createRoom', (data, callback) => {
    const newRoom = new Room(io, player, data.name);
    roomList.push(newRoom);
    callback({
      success: true,
      room: newRoom.toJSON(),
    });
  });

  socket.on('playSign', (data, callback) => {
    if (data.sign && (data.sign === 'rock' || data.sign === 'paper' || data.sign === 'scissors')) {
      player.room.playSign(player, data.sign);
      callback({
        success: true,
      });
    } else {
      callback({
        success: false,
      });
    }
  });

  socket.on('exitRoom', (data, callback) => {
    if (player.room !== null) {
      if (player.room.playerList.length === 1) {
        const index = roomList.indexOf(player.room);
        if (index !== -1) {
          roomList.splice(index, 1);
          console.log(`Room ${player.room.name}: No player, deleting`);
        }
      }
      player.room.exitRoom(player);
      callback({
        success: true,
      });
    } else {
      callback({
        success: false,
      });
    }
  });

  socket.on('disconnecting', (reason) => {
    console.log(
      `Player ${player.username} (${player.userId}) is disconnecting. Reason: "${reason}"`,
    );
    if (player.room !== null) {
      if (player.room.playerList.length === 1) {
        const index = roomList.indexOf(player.room);
        if (index !== -1) {
          roomList.splice(index, 1);
          console.log(`Room ${player.room.name}: No player, deleting`);
        }
      }
      player.room.exitRoom(player);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Player ${player.username} (${player.userId}) disconnected. Reason: "${reason}"`);
  });

  socket.emit('ready');
});

module.exports = {
  io,
  roomList,
};
