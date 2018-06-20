'use strict';
module.exports = (sequelize, DataTypes) => {
  var Refund = sequelize.define('Refund', {
    userAddress: DataTypes.STRING,
    toAddress: DataTypes.STRING,
    amountInEther: DataTypes.STRING,
    refStart:DataTypes.BOOLEAN,
    refHash: DataTypes.STRING,
    refStatus: DataTypes.ENUM('Pending','Approved','Failed')
  }, {});
  Refund.associate = function(models) {
    // associations can be defined here
  };
  return Refund;
};