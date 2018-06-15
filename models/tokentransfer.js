'use strict';
module.exports = (sequelize, DataTypes) => {
  var TokenTransfer = sequelize.define('TokenTransfer', {
  	user_id:  DataTypes.INTEGER,
    fromAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    totalTokens: DataTypes.DECIMAL(10, 10) ,
    fromToken: DataTypes.DECIMAL(10, 10) ,
    toToken: DataTypes.DECIMAL(10, 10) ,
    transHash:DataTypes.STRING,
    transStatus:DataTypes.ENUM('Pending','Success','Failed'),
  }, {});
  TokenTransfer.associate = function(models) {
    // associations can be defined here
      TokenTransfer.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return TokenTransfer;
};