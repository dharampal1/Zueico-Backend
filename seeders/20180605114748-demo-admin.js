'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Admins', [{
        username: 'admin',
        password: 'admin',
        phone: '1234567890',
        totalToken: '10',
        soldToken: '5',
        email: 'admin@gmail.com',
      }], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins', null, {});
  }
};