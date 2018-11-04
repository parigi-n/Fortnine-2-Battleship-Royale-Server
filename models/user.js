module.exports = function userModel(sequelize, DataTypes) {
  const user = sequelize.define(
    'user',
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
    },
  );

  return user;
};
