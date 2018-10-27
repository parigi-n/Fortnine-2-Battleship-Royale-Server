const io = require("socket.io-client");
const socket = io.connect('http://localhost:4242', {
  query: {
    token: "testqsdqsd"
  }
});

socket.on('error', function(){
    console.log('auth Failed');
});
socket.on('connect_failed', function(){
    console.log('Connection Failed');
});

socket.on("azaza", function(data) {
  console.log(data);
  socket.emit('message', {azozo: "azozo"}, function (data) {
      console.log(data); // data will be 'woot'
    });
});
