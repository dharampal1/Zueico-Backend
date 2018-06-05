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
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
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
      createdAt: {
        type: Sequelize.DATE,
        default: Date.now()
      },
      updatedAt: {
        type: Sequelize.DATE,
        default: Date.now()
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Admins');
  }
};