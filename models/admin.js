'use strict';
module.exports = (sequelize, DataTypes) => {
  var Admin = sequelize.define('Admin', {
      username: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      resetPasswordToken:{
         type: DataTypes.STRING
      },
      resetPasswordExpires:{
         type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      phone: { 
         type: DataTypes.STRING
      },
      totalToken: { 
         type: DataTypes.INTEGER
      },
      soldToken: { 
         type: DataTypes.INTEGER
      },
  }, {});
  Admin.associate = function(models) {
    // associations can be defined here
    
  };
  return Admin;
};

