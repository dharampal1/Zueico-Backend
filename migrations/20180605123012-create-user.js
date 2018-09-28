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
        allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
         defaultValue:'',
        type: Sequelize.STRING
      },
      resetPasswordToken:{
        allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      resetPasswordExpires:{
        allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        defaultValue:'',
        unique:true,
        type: Sequelize.STRING
      },
      emailSent: {
         allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
      },
      security_session: { 
        allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      walletHash:{
         allowNull: false,
        defaultValue:'',
        type: Sequelize.STRING
      },
      mobileNumber: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      participationAmount: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      image: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      status: { 
         allowNull: false,
         defaultValue:'Pending',
         type: Sequelize.ENUM('Pending','Approved','Failed')
      },
      gender: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      dob: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      country: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      address: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      ethWalletAddress: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      btcWalletAddress: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      USDTAddress: {
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      walletMethod: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      currency: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      purchaseToken: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      tokenPassword :{ 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      keystore :{ 
         type: Sequelize.JSON
      },
      passport: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      drivingLicenceFront: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      drivingLicenceBack:{
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      addressProof: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      comments: { 
         allowNull: false,
         defaultValue:"",
         type: Sequelize.STRING
      },
      emailVerified:{ 
         allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
      },
      emailVerifyToken:{ 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      vestingToken: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      vestingRemainingToken: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      vestingStartDate: { 
         allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      airdrop_nric: {
        allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      airdrop_telegram: {
        allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      airdrop_code: {
        allowNull: false,
         defaultValue:'',
         type: Sequelize.STRING
      },
      airdrop_sent: {
         allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
      },
      airdrop_token_sent: {
         allowNull: false,
         type: Sequelize.BOOLEAN,
         defaultValue:false
      },
      previlege: { 
         allowNull: false,
         defaultValue:'0',
         type: Sequelize.ENUM('0','1','2')
      },
      updatedAt: { 
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.NOW
      },
      createdAt: { 
         allowNull: false,
         type: Sequelize.DATE,
         defaultValue: Sequelize.NOW
      }
    });
        },
        down: (queryInterface, Sequelize) => {
          return queryInterface.dropTable('Users');
        }
    };