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
        type:Sequelize.STRING
      },
      PreICOTokens: {
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
        type:Sequelize.STRING
      },
      VestingPeriod:{
        type:Sequelize.INTEGER
      },
      Country:{
        type:Sequelize.STRING
      },
      VestedTokens:{
        type:Sequelize.STRING
      },
      RemainingTokens:{
        type:Sequelize.STRING
      },
      vestHash: {
         type:Sequelize.STRING
       },
      vestStatus: {
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Approved','Failed')
       },
      vesting_period_date:{
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