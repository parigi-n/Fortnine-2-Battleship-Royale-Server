const models = require('../models/index');
const Sequelize = require('sequelize');

exports.users = {
  all() {
    console.log('call to ALL');
    return models.user.findAll({ raw: true });
    //.then(users => users.map(user => user.toJSON()));
  },
  one(userId) {
    console.log('call to ONE');
    return models.user.findById(userId, { raw: true });
  },
  patch(userId, payload) {
    console.log('call to PATCH');
    return models.user.update(request.payload, {
      where: { id: request.params.user_id },
      fields: Object.keys(payload)
    });
  },
  remove(request, h) {
    console.log('call to REMOVE');
    return models.user.destroy({ where: { id: request.params.user_id } });
  },
};

exports.auth = {
  checkIfExist(username) {
    return models.user.find({ where: { username }, raw: true });
  },
  login(username, password) {
    return models.user.find({
      where: {
        [Sequelize.Op.and]: [
          { username },
          { password },
        ],
      },
      raw: true
    });
  },
  register(payload) {
    return models.user.create(payload, { fields: Object.keys(payload) });
  },
};
