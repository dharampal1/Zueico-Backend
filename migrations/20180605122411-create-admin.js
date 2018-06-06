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
        type: Sequelize.STRING
      },
      password: {
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
      soldToken: {
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
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