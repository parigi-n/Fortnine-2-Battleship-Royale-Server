

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const plugins = [];

plugins.push(Inert, Vision, {
  plugin: HapiSwagger,
  options: {
    info: {
      title: 'Fortnine Battleship API Documentation',
      version: '1.0',
    },
  },
});

module.exports = plugins;
