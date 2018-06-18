'use strict';
module.exports = (sequelize, DataTypes) => {
  var TokenTransfer = sequelize.define('TokenTransfer', {
  	user_id:  DataTypes.INTEGER,
    fromAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    totalTokens: DataTypes.DECIMAL(60,20),
    fromToken: DataTypes.DECIMAL(60,20),
    toToken: DataTypes.DECIMAL(60,20),
    transHash:DataTypes.STRING,
    transStatus:DataTypes.ENUM('Pending','Approved','Failed'),
  }, {});
  TokenTransfer.associate = function(models) {
    // associations can be defined here
      TokenTransfer.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return TokenTransfer;
};

 