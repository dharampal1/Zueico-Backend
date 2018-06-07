'use strict';
module.exports = (sequelize, DataTypes) => {
    var User = sequelize.define('User', {
    username: DataTypes.STRING,
    password:  DataTypes.STRING,
    resetPasswordToken:DataTypes.STRING,
    resetPasswordExpires:DataTypes.STRING,
    email:  DataTypes.STRING,
    mobileNumber:  DataTypes.STRING,
    participationAmount: DataTypes.INTEGER,
    image: DataTypes.STRING,
    status: DataTypes.ENUM('0','1'),
    gender: DataTypes.STRING,
    dob: DataTypes.STRING,
    country: DataTypes.STRING,
    address: DataTypes.STRING,
    ethWalletAddress: DataTypes.STRING,
    btcWalletAddress: DataTypes.STRING,
    walletMethod: DataTypes.STRING,
    currency: DataTypes.STRING,
    emailVerified:{ 
         type: DataTypes.BOOLEAN,
         defaultValue:false
      },
    purchaseToken: DataTypes.STRING,
    tokenPassword:DataTypes.STRING,
    keystore:DataTypes.STRING,
    tokenAddress:DataTypes.STRING,
    passport: DataTypes.STRING,
    drivingLicenceFront: DataTypes.STRING,
    drivingLicenceBack: DataTypes.STRING,
    addressProof: DataTypes.STRING,
    comments: DataTypes.STRING,
    emailVerifyToken:DataTypes.STRING,
    vewtingToken: DataTypes.STRING,
    vewtingRemainingToken: DataTypes.STRING,
    vewtingStartDate: DataTypes.STRING,
    previledge: DataTypes.ENUM('0','1')
   }, {});
   User.associate = function(models) {
        // associations can be defined here
      };
      return User;
    };