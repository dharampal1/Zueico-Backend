'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Admins', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        defaultValue:'',
        unique:true,
        type: Sequelize.STRING
      },
      publicStripeKey:{
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      resetPasswordToken: {
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      resetPasswordExpires: {
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      totalToken: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      btcWalletAddress:{
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      contract:{
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      soldToken: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      updatedAt: { 
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.NOW
      },
      createdAt: { 
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.NOW
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Admins');
  }
};
