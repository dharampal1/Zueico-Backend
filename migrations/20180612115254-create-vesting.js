'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('VestingPeriods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ico_tokens: {
        type:Sequelize.STRING
      },
      pre_ico_tokens: {
        type:Sequelize.STRING
      },
      name: {
        type:Sequelize.STRING
      },
      email: {
        type:Sequelize.STRING
      },
      phone: {
        type:Sequelize.STRING
      },
      total_purchase: { 
        type:Sequelize.STRING
      },
      vesting_period:{
        type:Sequelize.INTEGER
      },
      country:{
        type:Sequelize.STRING
      },
      vested_tokens:{
        type:Sequelize.STRING
      },
      remaining_tokens:{
        type:Sequelize.STRING
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
    return queryInterface.dropTable('VestingPeriods');
  }
};