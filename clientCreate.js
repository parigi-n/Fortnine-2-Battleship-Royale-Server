const io = require("socket.io-client");
//ID 1//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTU0MDY5MzY3MCwiZXhwIjoxNTQxOTAzMjcwLCJpc3MiOiJPcHRpZ3JvdyIsImp0aSI6IjEwZjIyN2QwLWRhNTktMTFlOC1iZWU2LTUxOTdkODczMzYxOCJ9.JEB8yCEdRvYATZ1MH-zSx_BinRAVuq_BrZ9khew3yXo
//ID 2//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU0MDY5MzcwOSwiZXhwIjoxNTQxOTAzMzA5LCJpc3MiOiJPcHRpZ3JvdyIsImp0aSI6IjI4MThhYjUwLWRhNTktMTFlOC1iZWU2LTUxOTdkODczMzYxOCJ9.MCGONwaXSHH0y5ys3qngFjJ_fe6l8TSKTC3rX-DSMUU

const socket = io.connect('http://localhost:4242', {
  query: {
    //token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTU0MDY5MzY3MCwiZXhwIjoxNTQxOTAzMjcwLCJpc3MiOiJPcHRpZ3JvdyIsImp0aSI6IjEwZjIyN2QwLWRhNTktMTFlOC1iZWU2LTUxOTdkODczMzYxOCJ9.JEB8yCEdRvYATZ1MH-zSx_BinRAVuq_BrZ9khew3yXo",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU0MDY5MzcwOSwiZXhwIjoxNTQxOTAzMzA5LCJpc3MiOiJPcHRpZ3JvdyIsImp0aSI6IjI4MThhYjUwLWRhNTktMTFlOC1iZWU2LTUxOTdkODczMzYxOCJ9.MCGONwaXSHH0y5ys3qngFjJ_fe6l8TSKTC3rX-DSMUU"
  }
});

socket.on('error', function() {
  console.log('auth Failed');
});
socket.on('connect_failed', function() {
  console.log('Connection Failed');
});


// socket.on("ready", function(data) {
//   console.log(data);
//   socket.emit('joinRoom', {id: "c112e770-da5f-11e8-ba1e-43380cdbe90b"}, function (data) {
//       console.log("joinRoom", data);
//     });
// });

socket.on("ready", function(data) {
  socket.emit('createRoom', {
    name: "Test42"
  }, function(data) {
    console.log(data);
  });
});

socket.on("gameStart", function(data) {
  console.log("gameStart", data);
});

socket.on("gameEnd", function(data) {
  console.log("gameEnd", data);
});

/*socket.on("roundStart", function(data) {
  console.log("roundStart", data);
  socket.emit('playSign', {
    sign: "paper"
  }, function(data) {
    console.log("playSign", data); // data will be 'woot'
  });
});*/
socket.on("roundStart", function(data) {
  console.log("roundStart", data);
  /*socket.emit('playSign', {
    sign: "paper"
  }, function(data) {
    console.log("playSign", data); // data will be 'woot'
  });*/
  setTimeout(function(){
    socket.emit('exitRoom', {
    }, function(data) {
      console.log("exitRoom", data); // data will be 'woot'
    });
  }, 3000);
});

socket.on("roundEnd", function(data) {
  console.log("roundEnd", data);
});

socket.on("playerJoined", function(data) {
  console.log("playerJoined", data);
});

socket.on("playerExit", function(data) {
  console.log("playerExit", data);
});
