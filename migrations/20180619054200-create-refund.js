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
      refStart:{
         allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
       },
      refHash: {
        type: Sequelize.STRING
      },
      refStatus: {
         allowNull: false,
         defaultValue:'Pending',
         type:Sequelize.ENUM('Pending','Approved','Failed')
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