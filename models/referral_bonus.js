'use strict';
module.exports = (sequelize, DataTypes) => {
  var Referral_Bonus = sequelize.define('Referral_Bonus', {
    refeWalletAddress: DataTypes.STRING,
    refeTokens: DataTypes.STRING,
    refeHash: DataTypes.STRING,
    refeStatus: DataTypes.ENUM('Pending','Approved','Failed')
  }, {});
  Referral_Bonus.associate = function(models) {
    // associations can be defined here
  };
  return Referral_Bonus;
};