'use strict';
module.exports = (sequelize, DataTypes) => {
  var BuyToken = sequelize.define('BuyToken', {
  	user_id:  DataTypes.INTEGER,
    walletMethod: DataTypes.STRING,
    amount: DataTypes.STRING,
    purchaseToken: DataTypes.STRING
  }, {});
  BuyToken.associate = function(models) {
    // associations can be defined here
  };
  return BuyToken;
};