const Sequelize = require('sequelize');
const models = require('../models/index');

exports.users = {
  all() {
    return models.user.findAll({ raw: true });
  },
  one(userId) {
    return models.user.findById(userId, { raw: true });
  },
};

exports.auth = {
  checkIfExist(username) {
    return models.user.find({ where: { username }, raw: true });
  },
  login(username, password) {
    return models.user.find({
      where: {
        [Sequelize.Op.and]: [{ username }, { password }],
      },
      raw: true,
    });
  },
  register(payload) {
    return models.user.create(payload, { fields: Object.keys(payload) });
  },
};
