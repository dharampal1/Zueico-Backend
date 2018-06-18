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
    status: DataTypes.ENUM('Pending','Approved','Failed'),
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
    walletHash:DataTypes.STRING,
    purchaseToken: DataTypes.STRING,
    tokenPassword:DataTypes.STRING,
    keystore:DataTypes.JSON,
    passport: DataTypes.STRING,
    drivingLicenceFront: DataTypes.STRING,
    drivingLicenceBack: DataTypes.STRING,
    addressProof: DataTypes.STRING,
    comments: DataTypes.STRING,
    emailVerifyToken:DataTypes.STRING,
    vewtingToken: DataTypes.STRING,
    vewtingRemainingToken: DataTypes.STRING,
    vewtingStartDate: DataTypes.STRING,
    previlege: DataTypes.ENUM('0','1')
   }, {});
   User.associate = function(models) {
        // associations can be defined here
        User.hasMany(models.BuyToken, {
          foreignKey: 'user_id',
        });
        User.hasMany(models.TokenTransfer, {
          foreignKey: 'user_id',
        });
      };
      return User;
 };