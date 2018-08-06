'use strict';
module.exports = (sequelize, DataTypes) => {
  var PrivelegeUser = sequelize.define('PrivelegeUser', {
    Name: DataTypes.STRING,
  	Email: DataTypes.STRING,
  	Phone: DataTypes.STRING,
    user_id:DataTypes.INTEGER,
    Country: DataTypes.STRING,
    ICOTokens: DataTypes.STRING,
    PreICOTokens:DataTypes.STRING,
  	TotalPurchase:DataTypes.STRING,
  	VestingPeriod:DataTypes.INTEGER,
  	VestedTokens:DataTypes.STRING,
  	RemainingTokens:DataTypes.STRING,
    vestHash: DataTypes.STRING,
    vestAddressHash: DataTypes.STRING,
    relHash:DataTypes.STRING,
    relStatus: DataTypes.ENUM('Pending','Approved','Failed'),
    vestStatus: DataTypes.ENUM('Pending','Approved','Failed'),
    vestAddressStatus: DataTypes.ENUM('Pending','Approved','Failed'),
    vesting_period_date: DataTypes.DATE
  }, {});
  PrivelegeUser.associate = function(models) {
    // associations can be defined here
     PrivelegeUser.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };
  return PrivelegeUser;
};

