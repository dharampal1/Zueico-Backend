'use strict';
module.exports = (sequelize, DataTypes) => {
  var TokenTransfer = sequelize.define('TokenTransfer', {
  	user_id:  DataTypes.INTEGER,
    fromAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    totalTokens: DataTypes.INTEGER,
    fromToken: DataTypes.INTEGER,
    toToken: DataTypes.INTEGER
  }, {});
  TokenTransfer.associate = function(models) {
    // associations can be defined here
      TokenTransfer.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return TokenTransfer;
};