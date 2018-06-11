'use strict';
module.exports = (sequelize, DataTypes) => {
  var btc_transaction = sequelize.define('btc_transaction', {
    hash: DataTypes.STRING,
    transaction_date: DataTypes.DATE,
    from_address: DataTypes.STRING,
    to_address: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    block_hight: DataTypes.STRING,
    user_id: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  btc_transaction.associate = function(models) {
    // associations can be defined here
  };
  return btc_transaction;
};