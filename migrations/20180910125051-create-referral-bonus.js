'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Referral_Bonus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Refwalletaddress: {
        type: Sequelize.STRING
      },
      tokens: {
        type: Sequelize.STRING
      },
      BonusStatus: {
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
    return queryInterface.dropTable('Referral_Bonus');
  }
};