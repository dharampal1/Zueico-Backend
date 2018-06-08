'use strict';
module.exports = (sequelize, DataTypes) => {
  var TokenTransfer = sequelize.define('TokenTransfer', {
  	user_id:  DataTypes.INTEGER,
    fromAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    token: DataTypes.INTEGER
  }, {});
  TokenTransfer.associate = function(models) {
    // associations can be defined here
  };
  return TokenTransfer;
};