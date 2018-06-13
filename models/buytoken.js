'use strict';
module.exports = (sequelize, DataTypes) => {
  var BuyToken = sequelize.define('BuyToken', {
  	user_id:  DataTypes.INTEGER,
    walletMethod: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    tokens: DataTypes.INTEGER,
    buyHash: DataTypes.STRING,
    buyStatus: DataTypes.ENUM('Pending','Success','Failed'),
    userAddress:DataTypes.STRING
  }, {});
  BuyToken.associate = function(models) {
    //associations can be defined here
    BuyToken.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return BuyToken;
};