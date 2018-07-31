'use strict';
module.exports = (sequelize, DataTypes) => {
  var Usd_transaction = sequelize.define('Usd_transaction', {
    usd_hash: DataTypes.STRING,
    transaction_date: DataTypes.DATE,
    from_address: DataTypes.STRING,
    to_address: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    block_hight: DataTypes.STRING,
    user_id: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  Usd_transaction.associate = function(models) {
    // associations can be defined here
  };
  return Usd_transaction;
};