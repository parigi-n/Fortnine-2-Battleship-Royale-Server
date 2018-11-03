const routes = [];
routes.push(
  require('./routes/user'),
  require('./routes/auth'),
  require('./routes/room'),
);

module.exports = [].concat(...routes); // flat array
