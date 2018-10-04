const Boom = require('boom');

const http = {
  errorSql: Boom.internal('Internal Mysql Error'),
  forbidden: Boom.forbidden('Access to resource not allowed'),
  notFound: Boom.notFound('Resource not found')
};

const error = {
  http: http
};

module.exports = error;
