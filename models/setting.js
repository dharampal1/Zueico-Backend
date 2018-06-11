'use strict';
module.exports = (sequelize, DataTypes) => {
  var Setting = sequelize.define('Setting', {
    key: DataTypes.STRING,
    type:DataTypes.ENUM('live','test')
  }, {});
  Setting.associate = function(models) {
    // associations can be defined here
  };
  return Setting;
};