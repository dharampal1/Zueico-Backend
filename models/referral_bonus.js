'use strict';
module.exports = (sequelize, DataTypes) => {
  var Referral_Bonus = sequelize.define('Referral_Bonus', {
    Refwalletaddress: DataTypes.STRING,
    tokens: DataTypes.STRING,
    BonusStatus: DataTypes.ENUM('Pending','Approved','Failed')
  }, {});
  Referral_Bonus.associate = function(models) {
    // associations can be defined here
  };
  return Referral_Bonus;
};