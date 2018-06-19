'use strict';
module.exports = (sequelize, DataTypes) => {
  var Refund = sequelize.define('Refund', {
    userAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    amountInEther: DataTypes.STRING,
    refHash: DataTypes.STRING,
    refStatus: DataTypes.STRING
  }, {});
  Refund.associate = function(models) {
    // associations can be defined here
  };
  return Refund;
};