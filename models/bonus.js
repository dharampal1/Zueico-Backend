'use strict';
module.exports = (sequelize, DataTypes) => {
  var Bonus = sequelize.define('Bonus', {
    Name: DataTypes.STRING,
    Email: DataTypes.STRING,
    Phone: DataTypes.STRING,
    Country:DataTypes.STRING,
    BonusTokens: DataTypes.STRING,
    EthAddress: DataTypes.STRING
  }, {});
  Bonus.associate = function(models) {
    // associations can be defined here
  };
  return Bonus;
};