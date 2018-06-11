'use strict';
module.exports = (sequelize, DataTypes) => {
  var mastercard = sequelize.define('mastercard', {
    user_id:DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.STRING,
    dob: DataTypes.DATE,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    zipcode: DataTypes.INTEGER,
    purchasedtokens: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    cardType:DataTypes.STRING,
    tokenbuydate: DataTypes.DATE
  }, {});
  mastercard.associate = function(models) {
    // associations can be defined here
  };
  return mastercard;
};