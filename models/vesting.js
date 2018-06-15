'use strict';
module.exports = (sequelize, DataTypes) => {
  var VestingPeriod = sequelize.define('VestingPeriod', {
    ico_tokens: DataTypes.STRING,
    pre_ico_tokens:DataTypes.STRING,
    name: DataTypes.STRING,
  	email: DataTypes.STRING,
  	phone: DataTypes.STRING,
  	total_purchase:DataTypes.STRING,
  	vesting_period:DataTypes.INTEGER,
  	country: DataTypes.STRING,
  	vested_tokens:DataTypes.STRING,
  	remaining_tokens:DataTypes.STRING,
    vestHash: DataTypes.STRING,
    vestStatus: DataTypes.ENUM('Pending','Success','Failed'),
    vesting_period_date: DataTypes.DATE
  }, {});
  VestingPeriod.associate = function(models) {
    // associations can be defined here
  };
  return VestingPeriod;
};

