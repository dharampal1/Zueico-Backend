mport Promise from 'promise';
import { Admin } from '../models';
import jwt from 'jsonwebtoken';
import config from './../config/environment';
import {
  checkBlank
} from '../helpers/requestHelper';
import {
  emailValidation
} from '../helpers/emailHelper';
import {
  verifyToken,
  hashPassword,
  verifyPassword,
  createWallet
} from '../helpers/userHelper';
import nodemailer from 'nodemailer';
import randtoken from 'rand-token';
import Sequelize from 'sequelize';
import path from 'path';
import  hbs from 'nodemailer-express-handlebars';
import emailCheck from 'email-check';

const Op = Sequelize.Op;

module.exports = {
changePassword(req, res, next) {

    var admin_id = req.id,
      oldPassword = req.body.oldPassword,
      newPassword = req.body.newPassword,
      confirmPassword = req.body.confirmPassword,
      mainValues = [oldPassword, newPassword, confirmPassword];

    if (checkBlank(mainValues) === 0) {
      Admin.findOne({
          where: {
            id: admin_id
          }
        })
        .then(data => {
          if (data) {
            verifyPassword(oldPassword, data)
              .then(result => {
                if (result.isValid === true) {
                  if (newPassword === confirmPassword) {
                    hashPassword(newPassword)
                      .then(hash => {
                        Admin.update({
                            password: hash
                          }, {
                            where: {
                              id: admin_id
                            }
                          })
                          .then(data => {
                            res.status(200).json({
                              status:true,
                              message: "Password Updated Successfully",
                            });
                          })
                      })
                      .catch(err => {
                        res.status(500).json({
                          status:false,
                          message: err.message
                        });
                      });
                  } else {
                    res.status(200).json({
                      status:false,
                      message: "newPassword is Not Matched",
                    });
                  }

                } else {
                  res.status(400).json({
                    status:false,
                    message: "oldPassword is not matched"
                  });
                }
              })
              .catch(err => {
                res.status(500).json({
                  status:false,
                  message: err.message
                });
              });
          } else {
            return res.status(404).json({
              status:false,
              message: 'No Data found'
            });
          }
        })
        .catch(err => {
          res.status(500).json({
            status:false,
            message: err.message
          });
        });
    } else {
      res.status(422).json({
         status:false,
         message: "You are not sending valid Request Params",
         required: "newPassword, oldPassword, confirmPassword"
      });
    }
  },
  forgotPassword(req, res, next) {
      var email = req.body.email;
      Admin.findOne({
         where: { email }
        }).then(user => {
        if (!user) {
           return res.status(404).json({
               status: false,
               message: "No Data Found"
            });
         } else {
            var token = randtoken.generate(16);
            Admin.update({
               resetPasswordToken: token,
               resetPasswordExpires: Date.now() + 10800000
            },{
              where:{ id: user.id }
            })
            .then(new_user => {

                  var transporter = nodemailer.createTransport(config.smtpConfig);

                   var handlebarsOptions = {
                    viewEngine: 'handlebars',
                    viewPath: path.resolve('./templates/'),
                    layoutsDir:path.resolve('./templates/'),
                    extName: '.hbs'
                  };

                  transporter.use('compile', hbs(handlebarsOptions));
                  // setup email data with unicode symbols
                  let link = "https://zuenchain.io/admin/reset_password?token=" + token;
                  
        
                  var data = {
                     from: `${config.smtpConfig.auth.user}`,
                     to: `${email}`, // reciver email
                     template: 'forgot-password',
                     subject: 'Reset your Password',
                     context: {
                     url: link,
                    }
                  };
                  // send mail with defined transport object
                  transporter.sendMail(data, (error, info) => {
                     if (error) {
                        return res.status(500).josn({
                           status: false,
                           message: "Unable to send the email : " + error.message,
                        });
                     }
                     res.status(200).json({
                        status: true,
                        message: "Reset Link is sent to your email Successfully"
                     });
                  });
            })
            .catch(err => {
                res.status(500).json({
                  status: false,
                  message: err.message
                });
             });
          }
      })
      .catch(err => {
         res.status(500).json({
           status: false,
            message: err.message
          });
      });    
  },

  resetPassword(req, res, next){
    var token = req.body.token,
        newPassword = req.body.newPassword,
        confirmPassword = req.body.confirmPassword,
        mainValues = [newPassword, confirmPassword];

    if (checkBlank(mainValues) === 0) {

    Admin.findOne({
             where: {
              [Op.and]: [{
                resetPasswordToken:token
              },
              {
              resetPasswordExpires : {[Op.gt]: Date.now() }
              }]
            }
         })
         .then(user => {   
            if (user) {
              if(user.resetPasswordToken === token) {
               if (newPassword === confirmPassword) {
                  hashPassword(newPassword)
                  .then(hash => {
                   var password = hash,
                       resetPasswordToken = '',
                       resetPasswordExpires = '';

                  Admin.update({
                      password,
                      resetPasswordToken,
                      resetPasswordExpires
                  },
                  { where:{ id : user.id } ,
                    returning:true,
                    plain:true
                  })
                   .then(result => {

                     var transporter = nodemailer.createTransport(config.smtpConfig);
                    // setup email data with unicode symbols

                     var handlebarsOptions = {
                      viewEngine: 'handlebars',
                      viewPath: path.resolve('./templates/'),
                      layoutsDir:path.resolve('./templates/'),
                      extName: '.hbs'
                    };

                   transporter.use('compile', hbs(handlebarsOptions));

                   var data = {
                         to: user.email,
                         from: config.smtpConfig.auth.user,
                         template:'reset-password',
                         subject: 'Password Reset Confirmation Email',
                      };

                     
                      // send mail with defined transport object
                      transporter.sendMail(data, (error, info) => {
                         if (error) {
                            return res.status(500).send({
                               status: false,
                               message: error.message
                            });
                         }
                         res.status(200).json({
                            status: true,
                            message: "Password is reset Successfully."
                         });
                       });
                     })

                  })
                  .catch(err => {
                   res.status(500).json({
                     status: false,
                      message: err.message
                    });
                });    
               } else {
                  return res.status(422).send({
                     status: false,
                     message: 'Passwords do not match'
                  });
               }
            } else {
               return res.status(400).send({
                  status: false,
                  message: 'Password reset token is invalid or has expired.'
               });
            }
          } else {
              return res.status(404).send({
                  status: false,
                  message: 'Password reset token is invalid or has expired.'
               });
          }
         })
         .catch(err => {
         res.status(500).json({
            status: false,
            message: err.message
          });
      });    
  } else {
    return res.status(422).send({
        status: false,
        message: 'You Are not sending valid params',
        required:"newPassword, confirmPassword, token"
      });
  }
 }

}

