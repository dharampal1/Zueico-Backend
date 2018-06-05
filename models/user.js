'use strict';
module.exports = (sequelize, DataTypes) => {
  var Users = sequelize.define('Users', {
    username: DataTypes.STRING,
    password:  DataTypes.STRING,
    resetPasswordToken:DataTypes.STRING,
    resetPasswordExpires:DataTypes.STRING,
    email:  DataTypes.STRING,
    mobileNumber:  DataTypes.STRING,
    participationAmount: DataTypes.INTEGER,
	image: DataTypes.STRING,
	status: DataTypes.ENUM('0','1'),
	gender: DataTypes.INTEGER,
	dob: DataTypes.DATE,
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
	passport: DataTypes.STRING,
	drivingLicenceFront: DataTypes.STRING,
	drivingLicenceBack: DataTypes.STRING,
	addressProof: DataTypes.STRING,
	comments: DataTypes.TEXT,
	emailVerifyToken:DataTypes.STRING,
	vewtingToken: DataTypes.STRING,
	vewtingRemainingToken: DataTypes.STRING,
	vewtingStartDate: DataTypes.DATE,
	previledge: DataTypes.ENUM('0','1')
  }, {});
  Users.associate = function(models) {
    // associations can be defined here
    
  };
  return Users;
};

