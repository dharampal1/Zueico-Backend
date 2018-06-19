'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Refunds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userAddress: {
        type: Sequelize.STRING
      },
      toAddress: {
        type: Sequelize.STRING
      },
      amountInEther: {
        type: Sequelize.STRING
      },
      refHash: {
        type: Sequelize.STRING
      },
      refStatus: {
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
    return queryInterface.dropTable('Refunds');
  }
};