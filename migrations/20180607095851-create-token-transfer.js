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
         defaultValue:0.0,
         type: Sequelize.DECIMAL(30,30)
      },
      fromToken:{
         allowNull: false,
         defaultValue:0.0,
         type: Sequelize.DECIMAL(30,30)
      },
      transHash:{
         allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      transStatus:{
         allowNull: false,
        defaultValue:'Pending',
        type: Sequelize.ENUM('Pending','Success','Failed')
      },
      toToken:{
         allowNull: false,
         defaultValue:0.0,
         type: Sequelize.DECIMAL(30,30)
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