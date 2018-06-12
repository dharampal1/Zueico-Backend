'use strict';
module.exports = (sequelize, DataTypes) => {
  var Btc_price = sequelize.define('Btc_price', {
    BTC: DataTypes.STRING,
    ETH: DataTypes.STRING,
    USD: DataTypes.STRING
  }, {});
  Btc_price.associate = function(models) {
    // associations can be defined here
  };
  return Btc_price;
};