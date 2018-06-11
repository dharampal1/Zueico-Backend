'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TokenTransfers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      fromAddress: {
         allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      toAddress: {
         allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      totalTokens:{
         allowNull: false,
         defaultValue:0,
         type: Sequelize.INTEGER
      },
      fromToken:{
         allowNull: false,
         defaultValue:0,
         type: Sequelize.INTEGER
      },
      toToken:{
         allowNull: false,
         defaultValue:0,
         type: Sequelize.INTEGER
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
    return queryInterface.dropTable('TokenTransfers');
  }
};