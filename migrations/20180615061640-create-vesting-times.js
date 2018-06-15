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
      vestTime1: {
        type: Sequelize.STRING
      },
      vestTime1Hash:{
        type: Sequelize.STRING
      },
      vestTime1Status:{
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Success','Failed')
      },
      vestTime2: {
        type: Sequelize.STRING
      },
      vestTime2Hash:{
        type: Sequelize.STRING
      },
      vestTime2Status:{
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Success','Failed')
      },
      vestTime3: {
        type: Sequelize.STRING
      },
      vestTime3Hash:{
        type: Sequelize.STRING
      },
      vestTime3Status:{
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Success','Failed')
      },
      endTime: {
        type: Sequelize.STRING
      },
      endTimeHash:{
        type: Sequelize.STRING
      },
      endTimeStatus:{
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Success','Failed')
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