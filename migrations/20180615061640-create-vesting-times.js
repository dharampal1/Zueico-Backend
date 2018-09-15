'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('VestingTimes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startTime:{
        type: Sequelize.STRING
      },
      cliff: {
        type: Sequelize.STRING
      },
      vestingDuration: {
        type: Sequelize.INTEGER
      },
      interval: {
        type: Sequelize.INTEGER
      },
      vestTime1: {
        type: Sequelize.STRING
      },
      vestTime2: {
        type: Sequelize.STRING
      },
      vestTime3: {
        type: Sequelize.STRING
      },
      endTime: {
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
    return queryInterface.dropTable('VestingTimes');
  }
};