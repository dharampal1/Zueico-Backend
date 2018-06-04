'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
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
      mobileNumber: { 
         type: Sequelize.STRING
      },
      participationAmount: { 
         type: Sequelize.INTEGER
      },
      image: { 
         type: Sequelize.STRING
      },
      status: { 
         type: Sequelize.CHAR
      },
      gender: { 
         type: Sequelize.INTEGER
      },
      dob: { 
         type: Sequelize.DATE
      },
      country: { 
         type: Sequelize.STRING
      },
      address: { 
         type: Sequelize.STRING
      },
      ethWalletAddress: { 
         type: Sequelize.STRING
      },
      btcWalletAddress: { 
         type: Sequelize.STRING
      },
      walletMethod: { 
         type: Sequelize.STRING
      },
      currency: { 
         type: Sequelize.STRING
      },
      purchaseToken: { 
         type: Sequelize.INTEGER
      },
      passport: { 
         type: Sequelize.STRING
      },
      drivingLicenceFront: { 
         type: Sequelize.STRING
      },
      drivingLicenceBack:{
         type: Sequelize.STRING
      },
      addressProof: { 
         type: Sequelize.STRING
      },
      comments: { 
         type: Sequelize.TEXT
      },
      emailVerified:{ 
         type: Sequelize.BOOLEAN,
         defaultValue:false
      },
      emailVerifyToken:{ 
         type: Sequelize.STRING
      },
      vewtingToken: { 
         type: Sequelize.STRING
      },
      vewtingRemainingToken: { 
         type: Sequelize.STRING
      },
      vewtingStartDate: { 
         type: Sequelize.DATE
      },
      previledge: { 
         type: Sequelize.ENUM('Y','N')
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
    return queryInterface.dropTable('Users');
  }
};
