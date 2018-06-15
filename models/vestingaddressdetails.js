'use strict';
module.exports = (sequelize, DataTypes) => {
  var VestingAddressDetails = sequelize.define('VestingAddressDetails', {
    vestHash: DataTypes.STRING,
    status: DataTypes.ENUM('Pending','Success','Failed')
  }, {});
  VestingAddressDetails.associate = function(models) {
    // associations can be defined here
  };
  return VestingAddressDetails;
};