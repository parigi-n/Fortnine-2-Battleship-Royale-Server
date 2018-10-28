"use strict";

const routes = [];
routes.push(
  require("./routes/user"),
  require("./routes/auth"),
  require("./routes/room")
);

module.exports = [].concat.apply([], routes); //flat array
