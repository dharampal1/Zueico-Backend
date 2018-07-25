'use strict';
module.exports = (sequelize, DataTypes) => {
  var Admin = sequelize.define('Admin', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    publicStripeKey:DataTypes.STRING,
    btcWalletAddress:DataTypes.STRING,
    password: DataTypes.STRING,
    resetPasswordToken:DataTypes.STRING,
    resetPasswordExpires:DataTypes.STRING,
    phone: DataTypes.STRING,
    totalToken: DataTypes.INTEGER,
    contract:DataTypes.STRING,
    soldToken: DataTypes.INTEGER
  }, {});
  Admin.associate = function(models) {
    // associations can be defined here
  };
  return Admin;
};
