'use strict';
module.exports = (sequelize, DataTypes) => {
  var VestingTimes = sequelize.define('VestingTimes', {
    vestTime1: DataTypes.STRING,
    vestTime2: DataTypes.STRING,
    vestTime3: DataTypes.STRING,
    endTime: DataTypes.STRING
  }, {});
  VestingTimes.associate = function(models) {
    // associations can be defined here
  };
  return VestingTimes;
};