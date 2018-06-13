'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('BuyTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      walletMethod: {
         allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      amount: {
         allowNull: false,
         defaultValue:0,
        type: Sequelize.INTEGER
      },
      tokens: {
        allowNull: false,
        defaultValue:0,
        type: Sequelize.INTEGER
      },
      userAddress:{
        allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      buyHash: {
        type:Sequelize.STRING
      },
      buyStatus: {
        allowNull: false,
        defaultValue:'Pending',
        type: Sequelize.ENUM('Pending','Success','Failed')
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
    return queryInterface.dropTable('BuyTokens');
  }
};