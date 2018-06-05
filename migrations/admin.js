'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Admin', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      resetPasswordToken:{
         type: Sequelize.STRING
      },
      resetPasswordExpires:{
         type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: { 
         type: Sequelize.STRING
      },
      totalToken: { 
         type: Sequelize.INTEGER
      },
      soldToken: { 
         type: Sequelize.INTEGER
      },
      updatedAt: { 
         type: Sequelize.DATE,
         default: Date.now()
      },
      createdAt: { 
         type: Sequelize.DATE,
         default: Date.now()
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Admin');
  }
};
