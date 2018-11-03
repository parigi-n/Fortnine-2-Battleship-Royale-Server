const Hapi = require('hapi');
const AsyncRedisLib = require('async-redis');
const hapiAuthJwt2 = require('hapi-auth-jwt2');

const Models = require('./models');
const routes = require('./routes');
const plugins = require('./plugins');

let asyncRedisClient;

const server = new Hapi.Server({
  port: 3000,
  host: '0.0.0.0',
  routes: {
    cors: {
      credentials: true,
      origin: ['*'],
    },
  },
});

async function validateToken(decoded, request) {
  try {
    const res = await request.server.app.asyncRedisClient.get(
      `${decoded.userId}:${decoded.jti}`,
    );
    return res ? { isValid: true } : { isValid: false };
  } catch (err) {
    console.log('err:', err);
    return {
      isValid: false,
    };
  }
}

async function registerPlugins() {
  try {
    await Models.sequelize.sync();
    asyncRedisClient = AsyncRedisLib.createClient(
      'redis://:Yu8*@.dLKqDeVv@35.180.31.80:6379/1',
    );
    asyncRedisClient.on('error', (err) => {
      console.error(`Redis error ${err}`);
    });
    // Auth
    await server.register(hapiAuthJwt2);
    server.auth.strategy('jwt', 'jwt', {
      key: 'NeverShareYourSecret', // Never Share your secret key
      validate: validateToken, // validate function defined above
      verifyOptions: {
        algorithms: ['HS256'],
        ignoreExpiration: false,
        issuer: 'Optigrow',
      },
    });
    server.auth.default('jwt');
    server.app.asyncRedisClient = asyncRedisClient;

    server.route(routes);
    await server.register(plugins);
    await server.start();
    console.log('Server running at:', server.info.uri);
  } catch (error) {
    console.log(error, 'Failed to register hapi plugins');
    process.exit(1);
  }
}

registerPlugins();
server.events.on('stop', () => {
  console.log('Hapi shut down gracefully');
  asyncRedisClient.quit(() => {
    console.log('Redis shut down gracefully');
  });
  Models.sequelize.connectionManager.close().then(() => console.log('Sequelize shut down gracefully'));
});

module.exports = server;
