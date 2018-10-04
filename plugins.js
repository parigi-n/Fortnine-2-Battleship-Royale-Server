"use strict";

const Inert = require("inert");
const Vision = require("vision");
const HapiSwagger = require("hapi-swagger");

const plugins = [];

plugins.push(Inert, Vision, {
  plugin: HapiSwagger,
  options: {
    info: {
      title: "Optigrow central API Documentation",
      version: "2.0"
    }
  }
});

module.exports = plugins;
