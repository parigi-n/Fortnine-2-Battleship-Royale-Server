const Joi = require('joi');

const id = {
  user: Joi.number().integer().positive().description('Id of the user ')
};

const route = {
  user: {
    userId: id.user
  }
};

const auth = {
  register: {
    username: Joi.string().alphanum().min(3).max(30).required().description('User last name'),
    email: Joi.string().email({ minDomainAtoms: 2 }).required().description('User email'),
    password: Joi.string().min(8).max(32).required().description('User password')
  },
  login: {
    username: Joi.string().alphanum().min(3).max(30).required().description('User last name'),
    password: Joi.string().min(8).max(32).required().description('User password'),
  }
};
const schema = {
  id,
  route,
  auth
};

module.exports = schema;
