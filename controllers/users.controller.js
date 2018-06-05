import Promise from 'promise';
import {
  Users
} from '../models';
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
  verifyPassword
} from '../helpers/userHelper';
import {
  storage,
  imageFileFilter
} from '../helpers/fileUpload';
import multer from 'multer';
import nodemailer from 'nodemailer';
import randtoken from 'rand-token';
import Sequelize from 'sequelize';
import path from 'path';
import  hbs from 'nodemailer-express-handlebars';

const Op = Sequelize.Op;

module.exports = {

  createUser(req, res, next) {
    let mob = /^[1-9]{1}[0-9]{9}$/;
    var firstName = req.body.firstName,
      lastName = req.body.lastName,
      mobileNumber = req.body.mobileNumber,
      participationAmount = req.body.participationAmount,
      country = req.body.country,
      email = req.body.email,
      password = req.body.password,
      confirmPassword = req.body.confirmPassword,
      mainValues = [firstName, lastName,
        email, mobileNumber, participationAmount, country,
        password, confirmPassword
      ];

    if (checkBlank(mainValues) === 0) {
      Users.findOne({
          where: {
            email
          }
        })
        .then(result => {
          if (result) {
            return res.status(422).json({
              status: false,
              message: 'Email is already registered'
            });
          }
          if (emailValidation(email) !== true) {
            return res.status(422)
              .json({
                status: false,
                message: 'Email should be in valid format'
              });
          }
          if (mob.test(mobileNumber) !== true) {
            return res.status(422)
              .json({
                status: false,
                message: 'Mobile Number  is not in valid format'
              });
          }
          if (password === confirmPassword) {

            var username = firstName + lastName;
            hashPassword(password)
              .then(hash => {
                let token = randtoken.generate(16);
                let newUser = {
                  username,
                  mobileNumber,
                  participationAmount,
                  country,
                  email,
                  emailVerifyToken: token,
                  password: hash
                };
 
                var transporter = nodemailer.createTransport(config.smtpConfig);
                var handlebarsOptions = {
                    viewEngine: 'handlebars',
                    viewPath: path.resolve('./templates/'),
                    layoutsDir:path.resolve('./templates/'),
                    extName: '.hbs'
                  };

                 transporter.use('compile', hbs(handlebarsOptions));

                let link = "http://" + req.get('host') + "/login?token=" + token;
                var data = {
                  from: `${config.smtpConfig.auth.user}`,
                  to: `${email}`,
                  template: 'register',
                  subject: 'Account Activation Email',
                  context: {
                   url: link,
                   name: username
                  }
                };

                transporter.sendMail(data, (error) => {

                  if (error) {
                    return res.status(500).json({
                      status: false,
                      error: error
                    });
                  } else {
                    Users.create(newUser)
                      .then(result => {
                        res.status(201).json({
                          status: true,
                          message: "Account created successfully and verification email is sent to your Account."
                        });
                      })
                      .catch(err => {
                        res.status(500).json({
                          message: err
                        });
                      });
                  }
                });
              })
              .catch(err => {
                 console.log(err);
                res.status(500).json({
                  message: err
                });
              });

          } else {
            res.status(422).json({
              message: "Passwords are not matched"
            });
          }
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({
            message: err
          });
        });
    } else {
      res.status(422).json({
        message: "You are not sending valid Request Params",
        'Required-fields': "firstName, lastName, email, mobileNumber, participationAmount ,country, password, confirmPassword"
      });
    }
  },

  authenticate(req, res, next) {
    var email_token = req.body.token;
    var email = req.body.email;
    var password = req.body.password;
    var mainValues = [email, password];

    if (checkBlank(mainValues) === 0) {
      if (email_token) {
        Users.findOne({
            where: {
              email
            }
          })
          .then(data => {
            if (data.emailVerifyToken === '') {
              verifyPassword(password, data)
                .then(result => {
                  if (result.isValid === true) {
                    verifyToken(email_token, data)
                      .then(token1 => {
                        if (token1.isValid === true) {
                          Users.update({
                              emailVerifyToken: null,
                              emailVerified: 1
                            }, {
                              where: {
                                id: data.id
                              },
                              returning:true,
                              plain: true
                            })
                            .then(data1 => {
                              var token = jwt.sign({
                                id: data.id
                              }, config.SECRET, {
                                expiresIn: config.JWT_EXPIRATION
                              });

                              res.status(200).json({
                                message: 'authenticated, Token Attached',
                                userId: data.id,
                                token
                              });
                            })
                            .catch(err => {
                              res.status(500).json({
                                message: err
                              });
                            });

                        } else {
                          res.status(422).json({
                            message: 'Invalid Token'
                          });
                        }
                      })
                      .catch(err => {
                        res.status(500).json({
                          message: err.message
                        });
                      });
                  } else {
                    res.status(422).json({
                      message: 'Authentication failed'
                    });
                  }
                })
                .catch(err => {
                  res.status(500).json({
                    message: err
                  });
                });
            } else {
              res.status(404).json({
                message: 'Email is Already verifyed'
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              message: err
            });
          });

      } else {
        Users.findOne({
            where: {
              [Op.and]: [{
                email
              }, {
                emailVerified: 1
              }]
            }
          })
          .then(data => {
            if (data) {
              verifyPassword(password, data)
                .then(result => {
                  if (result.isValid === true) {

                    var token = jwt.sign({
                      id: result.id
                    }, config.SECRET, {
                      expiresIn: config.JWT_EXPIRATION
                    });

                    return res.status(200).json({
                      message: 'authenticated, Token Attached',
                      userId: result.id,
                      token
                    });
                  } else {
                    res.status(422).json({
                      message: 'Authentication failed'
                    });
                  }
                })
            } else {
              res.status(404).json({
                message: 'Email is not varified'
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              message: err
            });
          });
      }
    } else {
      res.status(422).json({
        message: "You are not sending valid Request Params",
        'Required-fields': "email, password"
      });
    }
  },
  getSingleUser(req, res, next) {
    var id = req.userId;


    Users.findOne({
        where: {
          id: id
        }
      })
      .then(data => {
        if (data) {
          res.status(200).json({
            message: "Your Profile Data",
            data
          });
        } else {
          res.status(404).json({
            message: "No user Found"
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          message: err
        });
      });
  },

  updateUser(req, res, next) {
    var userId = req.userId;

    if (Object.keys(req.body).length > 0) {
      Users.update(
          req.body, //set attribute 
          {
            where: {
              id: userId
            }
          } //where criteria 
        ).then((data) => {
          if (data) {
            res.status(200).json({
              message: "Updated Successfully",
              data
            });
          } else {
            res.status(404).json({
              message: "No Data Found"
            });
          }
        })
        .catch(err => {
          res.status(500).json({
            message: err
          });
        });
    } else {
      res.status(400).json({
        message: "You not not sending any value"
      });
    }

  },

  changePassword(req, res, next) {

    var user_id = req.userId,
      oldPassword = req.body.oldPassword,
      newPassword = req.body.newPassword,
      confirmPassword = req.body.confirmPassword,
      mainValues = [oldPassword, newPassword, confirmPassword];

    if (checkBlank(mainValues) === 0) {
      Users.findOne({
          where: {
            id: user_id
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
                        Users.update({
                            password: hash
                          }, {
                            where: {
                              id: user_id
                            }
                          })
                          .then(data => {
                            res.status(200).json({
                              message: "Password Updated Successfully",
                            });
                          })
                      })
                      .catch(err => {
                        res.status(500).json({
                          message: err
                        });
                      });
                  } else {
                    res.status(200).json({
                      message: "newPassword is Not Matched",
                    });
                  }

                } else {
                  res.status(400).json({
                    message: "oldPassword is not matched"
                  });
                }
              })
              .catch(err => {
                res.status(500).json({
                  message: err
                });
              });
          } else {
            return res.status(404).json({
              message: 'No User found'
            });
          }
        })
        .catch(err => {
          res.status(500).json({
            message: err
          });
        });
    } else {
      res.status(422).json({
        message: "You are not sending valid Request Params",
        'Required-fields': "newPassword,oldPassword,confirmPassword"
      });
    }
  },
  forgotPassword(req, res, next) {
      var email = req.body.email;
      Users.findOne({
         where: { [Op.and]: [{ email:email }, { emailVerified : 1}] }
        }).then(user => {
        if (!user) {
           return res.status(404).json({
               status: false,
               message: "No user Found"
            });
         } else {
            var token = randtoken.generate(16);
            Users.update({
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
                  let link = "http://" + req.get('host') + "/reset_password?token=" + token;
                  
        
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
                           message: "Unable to send the email",
                           error: error
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
                  message: err
                });
             });
          }
      })
      .catch(err => {
         res.status(500).json({
            message: err
          });
      });    
  },
  resetPassword(req, res, next){
    var token = req.body.token,
        email = req.body.email,
        newPassword = req.body.newPassword,
        confirmPassword = req.body.confirmPassword,
        mainValues = [email,newPassword, confirmPassword];

    if (checkBlank(mainValues) === 0) {

    Users.findOne({
             where: {
              [Op.and]: [{
                email:email
              },{
               emailVerified : 1
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
                  var  password = hash,
                    resetPasswordToken = null,
                    resetPasswordExpires = null;
                  Users.update({
                      password,
                      resetPasswordToken,
                      resetPasswordExpires
                  },
                  { where:{ email : email } ,
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
                                 error: error
                              });
                           }
                           res.json({
                              status: true,
                              message: "Confirmation email is sent"
                           });
                         });
                     })

                  })
                  .catch(err => {
                   res.status(500).json({
                      message: err
                    });
                });    
                 
               } else {
                  return res.status(422).send({
                     message: 'Passwords do not match'
                  });
               }
            } else {
               return res.status(400).send({
                  message: 'Password reset token is invalid or has expired.'
               });
            }
          } else {
             return res.status(400).send({
                  message: 'No user Found'
               });
          }

         })
         .catch(err => {
         res.status(500).json({
            message: err
          });
      });    
  } else {
    return res.status(422).send({
         message: 'You Are not sending valid params',
         required:"email, newPassword, confirmPassword,token"
      });
  }
 },
 uploadImage(req, res, next){
   
    var user_id = req.userId,
       fieldname = req.headers.fieldname;

    if(fieldname) {

    var upload = multer({   
      fileFilter: imageFileFilter,
      storage: storage
    }).single(fieldname);

    upload(req, res, function(err) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err
        });
      }
      console.log(req.file);
      if (req.file) {
        Users.findOne({
           where:{ id: user_id }
          })
          .then(data => {
            if (data) {
              Users.update({
                  [fieldname]: req.file.path
                },{
                  where: {id : user_id}
                },{
                  returning: true,
                  plain:true
                })
                .then(result => {
                  res.status(200).json({
                    status: true,
                    message: `${fieldname} Uploaded`,
                    [fieldname]:result[fieldname]
                  });
                });
            } else {
              res.status(404).json({
                status: false,
                message: "No User Found"
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              error: err
            });
          });
      } else {
        res.status(422).json({
          status: false,
          message: "No file is sent in Request"
        });
      }
    });
  } else {
     res.status(422).json({
          status: false,
          message: "fieldname is required"
     });
  }
 }
}

