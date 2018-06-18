'use strict';
module.exports = (sequelize, DataTypes) => {
  var VestingTimes = sequelize.define('VestingTimes', {
    vestTime1: DataTypes.STRING,
    vestTime1Hash: DataTypes.STRING,
    vestTime1Status:DataTypes.ENUM('Pending','Approved','Failed'),
    vestTime2: DataTypes.STRING,
    vestTime2Hash: DataTypes.STRING,
    vestTime2Status:DataTypes.ENUM('Pending','Approved','Failed'),
    vestTime3: DataTypes.STRING,
    vestTime3Hash: DataTypes.STRING,
    vestTime3Status:DataTypes.ENUM('Pending','Approved','Failed'),
    endTime: DataTypes.STRING,
    endTimeHash: DataTypes.STRING,
    endTimeStatus:DataTypes.ENUM('Pending','Approved','Failed')
  }, {});
  VestingTimes.associate = function(models) {
    // associations can be defined here
  };
  return VestingTimes;
};
