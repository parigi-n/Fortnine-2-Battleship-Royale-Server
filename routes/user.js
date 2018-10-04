const Joi = require('joi');
const Boom = require('boom');

const api = require('../helpers/sequelizeHelper');
const errorSchema = require('../helpers/error');
const validation = require('../helpers/validation');

const userBaseUrl = '/users';

module.exports = [{
  method: 'GET',
  path: `${userBaseUrl}`,
  options: {
    tags: ['api'],
    description: 'Returns all users',
  },
  handler: async (request, h) => {
    try {
      const response = await api.users.all();
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', null);
    }
  },
}, {
  method: 'GET',
  path: `${userBaseUrl}/{userId}`,
  options: {
    tags: ['api'],
    description: 'Returns data about user user_id',
    validate: {
      params: validation.route.user,
    },
  },
  handler: async (request, h) => {
    try {
      const response = await api.users.one(request.params.userId);
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  },
}, {
  method: 'GET',
  path: `${userBaseUrl}/me`,
  options: {
    tags: ['api'],
    description: 'Returns data about current user',
  },
  handler: async (request, h) => {
    try {
      const response = await api.users.one(request.auth.credentials.userId);
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  },
}, {
  method: 'PATCH',
  path: `${userBaseUrl}/{userId}`,
  options: {
    tags: ['api'],
    description: 'Modify the user',
    validate: {
      params: validation.route.user,
      payload: validation.auth.register
    },
  },
  handler: async (request, h) => {
    if (request.auth.credentials.userId !== request.params.userId)
      return errorSchema.http.forbidden;
    try {
      const response = await api.users.patch(request, h);
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  },
}, {
  method: 'DELETE',
  path: `${userBaseUrl}/{userId}`,
  options: {
    tags: ['api'],
    description: 'Delete the user',
    validate: {
      params: validation.route.user,
    },
  },
  handler: async (request, h) => {
    if (request.auth.credentials.userId !== request.params.userId)
      return errorSchema.http.forbidden;
    try {
      const response = await api.users.remove(request, h);
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  }
}];
