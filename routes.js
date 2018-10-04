"use strict";

const routes = [];
routes.push(
  require("./routes/user"),
  require("./routes/auth")
);

module.exports = [].concat.apply([], routes); //flat array
