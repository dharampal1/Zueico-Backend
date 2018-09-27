'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('PrivelegeUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ICOTokens: {
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.STRING
      },
      PreICOTokens: {
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.STRING
      },
      Name: {
        type:Sequelize.STRING
      },
      Email: {
        type:Sequelize.STRING
      },
      Phone: {
        type:Sequelize.STRING
      },
      user_id : {
        type: Sequelize.INTEGER
      },
      TotalPurchase: { 
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.STRING
      },
      VestingPeriod:{
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.INTEGER
      },
      Country:{
        type:Sequelize.STRING
      },
      VestedTokens:{
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.STRING
      },
      RemainingTokens:{
        allowNull: false,
        defaultValue:'0',
        type:Sequelize.STRING
      },
      vestHash: {
         type:Sequelize.STRING
      },
      vestAddressHash: {
        type:Sequelize.STRING
      },
      relHash: {
        type:Sequelize.STRING
      },
      vestStatus: {
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Approved','Failed')
       },
      vestAddressStatus: {
        allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Approved','Failed')
      },
      relStatus:{
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Approved','Failed')
      },
      vesting_period_date:{
        allowNull: false,
        defaultValue:'',
        type:Sequelize.STRING
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
    return queryInterface.dropTable('PrivelegeUsers');
  }
};