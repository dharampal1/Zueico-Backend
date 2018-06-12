'use strict';
module.exports = (sequelize, DataTypes) => {
  var Vesting = sequelize.define('Vesting', {
    address: DataTypes.STRING,
    amount: DataTypes.STRING,
    startDate: DataTypes.DATE
  }, {});
  Vesting.associate = function(models) {
    // associations can be defined here
  };
  return Vesting;
};