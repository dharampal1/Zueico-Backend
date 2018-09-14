'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Bonus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING
      },
      Email: {
        type: Sequelize.STRING
      },
      Phone: {
        type: Sequelize.STRING
      },
      BonusTokens: {
        type: Sequelize.STRING
      },
      Country: {
        type: Sequelize.STRING
      },
      BonusEthAddress: {
        type: Sequelize.STRING
      },
      BonusHash: {
        type:Sequelize.STRING
      },
      BonusTokenSent: {
        allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
      }
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
    return queryInterface.dropTable('Bonus');
  }
};