const Joi = require('joi');
const Boom = require('boom');

const errorSchema = require('../helpers/error');
const validation = require('../helpers/validation');
const {
  io,
  roomList
} = require('../websocket');

const roomBaseUrl = '/rooms';

module.exports = [{
  method: 'GET',
  path: `${roomBaseUrl}`,
  options: {
    tags: ['api'],
    description: 'Returns all rooms',
  },
  handler: async (request, h) => {
    try {
      return roomList;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', null);
    }
  },
}];
