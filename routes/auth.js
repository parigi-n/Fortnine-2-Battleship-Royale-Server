const Boom = require('boom');
const Jwt = require('jsonwebtoken');
const uuidv1 = require('uuid/v1');

const api = require('../helpers/sequelizeHelper');
const errorSchema = require('../helpers/error');
const validation = require('../helpers/validation');

module.exports = [{
  method: 'POST',
  path: '/auth/login',
  options: {
    tags: ['api', 'auth'],
    description: 'Return a Token',
    auth: false,
    cors: {
      additionalExposedHeaders: ['Authorization'], // 'Access-Control-Expose-Headers'
    },
    validate: {
      payload: validation.auth.login
    },
  },
  handler: async (request, h) => {
    try {
      const response = await api.auth.login(request.payload.username, request.payload.password);
      if (!response || response.length === 0)
        return Boom.unauthorized('Invalid login');
      const tokenData = { userId: response.id };
      const sessionId = uuidv1();
      const expiresIn = 86400 * 14 //14 jours en secondes
      request.server.app.asyncRedisClient.setex(`${tokenData.userId}:${sessionId}`, expiresIn, request.info.remoteAddress);
      const jwtToken = Jwt.sign(tokenData, 'NeverShareYourSecret', {
        algorithm: 'HS256',
        expiresIn: expiresIn,
        jwtid: sessionId,
        issuer: 'Optigrow',
      });

      return h.response({
        tokenType: 'JWT',
        expiresIn: expiresIn,
        user: response,
        redirect: '/',
        success: true
      }).header('Authorization', `Bearer ${jwtToken}`);
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  }
}, {
  method: 'POST',
  path: '/auth/register',
  options: {
    tags: ['api', 'auth'],
    description: 'Create a user',
    auth: false,
    validate: {
      payload: validation.auth.register
    }
  },
  handler: async (request, h) => {
    try {
      const responseCheckIfExist = await api.auth.checkIfExist(request.payload.username);
      if (responseCheckIfExist)
        return Boom.conflict('An user already exists with this username');
      const response = await api.auth.register(request.payload);
      return response;
    } catch (err) {
      console.log(err);
      return Boom.internal('Internal Mysql Error', err);
    }
  }
}, {
  method: 'GET',
  path: '/auth/logout',
  options: {
    tags: ['api', 'auth'],
    description: 'Logout',
  },
  handler: async (request, h) => {
    try {
      request.server.app.asyncRedisClient.del(`${request.auth.credentials.userId}:${request.auth.credentials.jti}`);
      return ({
        success: true,
      });
    } catch (error) {
      return Boom.internal('Internal error', err);
    }
  },
}, ];
