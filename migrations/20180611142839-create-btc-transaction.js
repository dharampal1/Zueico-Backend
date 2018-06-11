'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('btc_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hash: {
        type: Sequelize.STRING
      },
      transaction_date: {
        type: Sequelize.DATE
      },
      from_address: {
        type: Sequelize.STRING
      },
      to_address: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.INTEGER
      },
      block_hight: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('btc_transactions');
  }
};