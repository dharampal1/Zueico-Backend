import Promise from 'promise';
import {
  User,
  mastercard,
  BuyToken,
  Setting
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
  verifyPassword,
  createWallet
} from '../helpers/userHelper';
import nodemailer from 'nodemailer';
import randtoken from 'rand-token';
import Sequelize from 'sequelize';
import path from 'path';
import  hbs from 'nodemailer-express-handlebars';
import emailCheck from 'email-check';
import request from 'request';
import stripePackage from 'stripe';
//const stripe = stripePackage('sk_test_lwuoPgxDNCtdTYyG7YoDfyAw');
// const stripe = stripePackage('sk_test_umWqt35opoHjlW2FOT9ML8yK');


const  url = config.gapi_url;

const Op = Sequelize.Op;

module.exports = {

  checktoken(req, res, next) {
      var user_id = req.userId;

      if(user_id) {
          res.status(200).json({
              status:true,
              message:"Token is valid"
          });
      } else {
        res.status(422).json({
            status:false,
            message:"Token is not valid"
        });
      }    
  },

  checkSession(req, res, next) { 

    var user_id = req.userId,
        security_session = req.body.security_session;

    User.findOne({
        where: { [Op.and]: [{ security_session }, { id : user_id }] }
    })
      .then(data => {
         if(data) {
           res.status(200).json({
               status:true,
               message:"security session is Matched"
            });
         } else {
           res.status(422).json({
               status:false,
               message:"security session is not Matched"
            });
         }
       })
      .catch(err => {
         res.status(500).json({
               status:false,
               message:err.message
          });
      });
  },

  clearSession(req, res, next) {

      var user_id = req.userId;

      User.update({
        security_session:""
      },
      {
        where : { id : user_id }
      },{
        returning:true
      })
      .then(data => {
         if(data) {
           res.status(200).json({
               status:true,
               message:"security session is Removed"
            });
         } else {
           res.status(404).json({
               status:false,
               message:"No user Found"
            });
         }
       })
      .catch(err => {
         res.status(500).json({
               status:false,
               message:err.message
          });
      });

  },

  verifyPassword(req, res, next) {

     var user_id = req.userId,
         password = req.body.password;

     if(password) {

      User.findOne({
        where : { id : user_id }
      })
      .then(data => {
         if(data) {
           verifyPassword(password, data)
            .then(result => {
              if (result.isValid === true) {

                 let security_session = randtoken.generate(16);

                  User.update({ security_session
                  },{
                    where: { id : data.id }
                  },{
                    returning:true
                  })
                  .then(sec => {
                    if(sec) {
                    res.status(200).json({
                         status:true,
                         message:"Authenticated user",
                         security_session
                    });
                  } else {
                     res.status(400).json({
                       status:false,
                      message:"Not updated"
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
                 res.status(400).json({
                   status:false,
                  message:"Password is not matched"
                })
              }
          })
          .catch(err => {
              res.status(500).json({
                  status: false,
                  message: err.message
                });
          })
         } else {
          res.status(404).json({
            status:false,
            message:"No user Found"
          })
         }
      })
      .catch(err => {
              res.status(500).json({
                  status: false,
                  message: err.message
                });
     });

     } else {
       res.status(422).json({
          status:false,
          message:"password is required"
       })
     }

  },

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
        airdrop_nric = req.body.airdrop_nric,
        airdrop_telegram = req.body.airdrop_telegram,
        airdrop_code = req.body.airdrop_code,
        previlege = req.body.previlege,
        mainValues = [firstName,
        email, mobileNumber
      ];

     if (checkBlank(mainValues) === 0) {
       User.findOne({
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
          if(previlege !== '2'){
            
          if (password === confirmPassword) {

            var username = firstName + " " + lastName;
            hashPassword(password)
              .then(hash => {
                let token = randtoken.generate(16);
                let newUser = {
                  username,
                  mobileNumber,
                  participationAmount,
                  country,
                  email,
                  airdrop_nric,
                  airdrop_telegram,
                  airdrop_code,
                  previlege,
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

                let link = "https://zuenchain.com/login.php?token=" + token;
                var data = {
                  from: `${config.smtpConfig.auth.user}`,
                  to: `${email}`,
                  template: 'register',
                  subject: 'Welcome to Zuenchain!',
                  context: {
                   url: link,
                   name: firstName
                  },
                  attachments: [{
                    filename:'sample.pdf', 
                    contentType: 'application/pdf',
                    path: 'https://zuenchain.net:4000/public/files/sample.pdf'
                 }]
                };

                transporter.sendMail(data, (error) => {

                  if (error) {
                    return res.status(500).json({
                      status: false,
                      message: error.message
                    });
                  } else {
                    User.create(newUser)
                      .then(result => {
                        res.status(201).json({
                          status: true,
                          message: "Account created successfully and verification email is sent to your Account."
                        });
                      })
                      .catch(err => {
                        res.status(500).json({
                          status: false,
                          message: err.message
                        });
                      });
                  }
                });
              })
              .catch(err => {
                res.status(500).json({
                  status: false,
                  message: err.message
                });
              });

          } else {
            res.status(422).json({
              status: false,
              message: "Passwords are not matched"
            });
          }
        } else {
            var username = firstName;
            let password1 = 'test@123';
           hashPassword(password1)
              .then(hash => {
                let newUser = {
                  username,
                  mobileNumber,
                  email,
                  airdrop_nric,
                  airdrop_telegram,
                  airdrop_code,
                  previlege,
                  emailVerified: 1,
                  password: hash
                };

             User.create(newUser)
                .then(result => {
                  res.status(201).json({
                    status: true,
                    message: "Account created successfully for airdrop user"
                  });
                })
                .catch(err => {
                  res.status(500).json({
                    status: false,
                    message: err.message
                  });
                }); 
                 return null;
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              message: err.message
            });
          });
        }
        return null;
        })
          .catch(err => {
            res.status(500).json({
              status: false,
              message: err.message
            });
         });
       } else {
        res.status(422).json({
           status: false,
           message: "You are not sending valid Request Params",
           required: "previlege, firstName, email, mobileNumber"
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
        User.findOne({
            where: {
              email
            }
          })
          .then(data => {
              verifyPassword(password, data)
                .then(result => {
                  if (result.isValid === true) {
                    verifyToken(email_token, data)
                      .then(token1 => {
                        if (token1.isValid === true) {
                          User.update({
                              emailVerifyToken: '',
                              emailVerified: 1

                            }, {
                              where: {
                                id: data.id
                              },
                              returning:true,
                              plain: true
                            })
                            .then(data1 => {

                            createWallet(email,data)
                              .then(add => {
                            if(add.isValid === true){
                              var token = jwt.sign({
                                id: data.id,
                                email
                              }, config.SECRET, {
                                expiresIn: config.JWT_EXPIRATION
                              });

                              res.status(200).json({
                                status:true,
                                message: 'Authenticated, Token Attached',
                                userId: data.id,
                                username:data.username,
                                email:data.email,
				                        previlege:data.previlege,
                                token
                              });
                               }
                              })
                            })
                            .catch(err => {
                              res.status(500).json({
                                status: false,
                                message: err.message
                              });
                            });

                        } else {
                          res.status(422).json({
                            status: false,
                            message: 'Invalid Token'
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
                      message: 'Authentication failed'
                    });
                  }
                })
                .catch(err => {
                  res.status(500).json({
                    status:false,
                    message: err.message
                  });
                });
          })
          .catch(err => {
            res.status(500).json({
              status:false,
              message: err.message
            });
          });

      } else {
        User.findOne({
            where: {
                email
            }
          })
          .then(data => {
            if (data) {
              if(data.emailVerified === true){
                if(data.ethWalletAddress === ''){

                 verifyPassword(password, data)
                .then(result => {
                  if (result.isValid === true) {

                  createWallet(email,data)
                  .then(add => {
                    console.log(add);
                  if(add.isValid === true){

                    var token = jwt.sign({
                      id: data.id,
                      email
                    }, config.SECRET, {
                      expiresIn: config.JWT_EXPIRATION
                    });
                     res.status(200).json({
                      status:true,
                      message: 'Authenticated, Token Attached',
                      userId: data.id,
                      username:data.username,
                      email:data.email,
		                  previlege:data.previlege,
                      token
                    });
                     }
                    })
                    .catch(err => {
                       res.status(500).json({
                        status:false,
                        message: err.message
                      });
                    })
                    } else {
                    res.status(422).json({
                      status:false,
                      message: 'Authentication failed'
                    });
                  }
                })
                .catch(err => {
                   res.status(500).json({
                    status:false,
                    message: err.message
                  });
                })
            } else {
              verifyPassword(password, data)
                .then(result => {
                  if (result.isValid === true) {
                    var token = jwt.sign({
                      id: result.id,
                      email
                    }, config.SECRET, {
                      expiresIn: config.JWT_EXPIRATION
                    });

                    return res.status(200).json({
                      status:true,
                      message: 'Authenticated, Token Attached',
                      userId: result.id,
                      username:data.username,
                      email:data.email,
		                  previlege:data.previlege,
                      token
                    });
                  } else {
                    res.status(422).json({
                      status:false,
                      message: 'Authentication failed'
                    });
                  }
                })
              }
            } else {
              res.status(404).json({
                status:false,
                message: 'Email is not varified'
              });
            }
            } else {
              res.status(404).json({
                status:false,
                message: 'No user Found, Please check you Email'
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status:false,
              message: err.message
            });
          });
      }
    } else {
      res.status(422).json({
        status:false,
        message: "You are not sending valid Request Params",
        required: "email, password"
      });
    }
  },

  getKycStatus(req, res, next) {
    var id = req.userId;

    User.findOne({
        where: {
          id: id
        }
      })
      .then(data => {
        if (data) {
          res.status(200).json({
            status:true,
            message: "Your Kyc Status",
            data:{
              kycStatus:data.status
            }
          });
        } else {
          res.status(404).json({
            status:false,
            message: "No user Found"
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          status:false,
          message: err.message
        });
      });
  },

  //get Wallet Address : 
  getWalletAddress(req, res, next) {
    var id = req.userId;

    User.findOne({
        where: {
          id: id
        }
      })
      .then(data => {
        if (data) {
          var walletAddress = data.ethWalletAddress;
          res.status(200).json({
            status:true,
            message: "Your Wallet Address",
            addr:{
              walletAddress
            }
          });
        } else {
          res.status(404).json({
            status:false,
            message: "No user Found"
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          status:false,
          message: err.message
        });
      });
  },
  getSingleUser(req, res, next) {

    var id = req.userId;

    User.findOne({
        where: {
          id: id
        }
      })
      .then(data => {
        if (data) {
          res.status(200).json({
            status:true,
            message: "Your Profile Data",
            data
          });
        } else {
          res.status(404).json({
            status:false,
            message: "No user Found"
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          status:false,
          message: err.message
        });
      });
  },

  updateUser(req, res, next) {

    var userId = req.userId;

    if (Object.keys(req.body).length > 0) {
      User.update(
          req.body, //set attribute 
          {
            where: {
              id: userId
            }
          } //where criteria 
        ).then((data) => {
          if (data) {
            res.status(200).json({
              status:true,
              message: "Profile Updated Successfully"
            });
          } else {
            res.status(404).json({
              status:false,
              message: "No Data Found"
            });
          }
        })
        .catch(err => {
          if(err.original.errno == 1062){
             res.status(500).json({
              status:false,
              message: `This ${req.body.email} is already used.Please try another One.`
             });
           } else {
             res.status(500).json({
              status:false,
              message: err.message
           });
          }
        });
    } else {
      res.status(400).json({
        status:false,
        message: "You are not sending any value"
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
      User.findOne({
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
                        User.update({
                            password: hash
                          }, {
                            where: {
                              id: user_id
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
              message: 'No User found'
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
      User.findOne({
         where: { [Op.and]: [{ email:email }, { emailVerified : 1}] }
        }).then(user => {
        if (!user) {
           return res.status(404).json({
               status: false,
               message: "No user Found"
            });
         } else {
            var token = randtoken.generate(16);
            User.update({
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
                  let link = "https://zuenchain.com/reset_password.php?token=" + token;
                  
        
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

    User.findOne({
             where: {
              [Op.and]: [{
                resetPasswordToken:token
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
                   var password = hash,
                       resetPasswordToken = '',
                       resetPasswordExpires = '';

                  User.update({
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
                  message: 'No user Found'
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
 },

 chargeCard(req, res, next){
  
  let user_id = req.userId;
  let name =  req.body.name;
  let email =  req.body.email;
  let address =  req.body.address;
  let dob =  req.body.dob;
  let country =  req.body.country;
  let state =  req.body.state;
  let city =  req.body.city;
  let zipcode =  req.body.zipcode;
  let purchasedtokens =  req.body.purchasedtokens;
  let amount =  req.body.amount;
  let cardType = req.body.cardType;

  let userData = {
    name,
    email,
    address,
    dob,
    country,
    state,
    city,
    zipcode
  };

  //var currency = req.body.currency
  //var token = req.body.stripeToken;
  let description = "Charge for " + req.body.email; 
  let token = req.body.token
  // let credit_card = req.body.credit_card;//'4242424242424242';
  // let exp_month = req.body.exp_month;//12;
  // let exp_year = req.body.exp_year;//2019;
  // let cvc = req.body.cvc;//'123';
  // let card_holder_name = req.body.card_holder_name;  
  // stripe.tokens.create({
  //   card: {
  //     "number": credit_card,
  //     "exp_month": exp_month,
  //     "exp_year": exp_year,
  //     "cvc": cvc,
  //     "name": card_holder_name
  //   }
  // }, function(err, token) {
  //   console.log(token);
    // if (err) {
    //   return res.status(500).send({
    //      status: false,
    //      message: err.message
    //   });
    // }
    Setting.findOne({
      where:{ type: 'test'}
    })
    .then(keys => {
    const stripe = stripePackage(keys.key);
    stripe.customers.create({
      email: email,
      source: token
    }, function(err, customer) {
      if (err) {
        return res.status(500).send({
           status: false,
           message: err.message
        });
      }

      stripe.charges.create({
           amount:amount * 100,
           description: description,
           currency: "usd",
           customer: customer.id
      }, function(err, charge) {
        if (err) {
          return res.status(500).send({
             status: false,
             message: err.message
          });
        } else { 
          User.findOne({
            where:{id:user_id},
            attributes:['id','ethWalletAddress']
          })
          .then(user => {
            if(user){
         var usdtokenvalue = amount / 0.60,
             toAddress = user.ethWalletAddress;
   
       const body = { value:usdtokenvalue , toAddress };
  
      request.post({url:`${url}/sendTokensUSDusers`,form:body },function(err,httpResponse,body){

          if(err){
             return res.status(500).send({
               status: false,
               message: err.message
              });
          } else {

          var result1 = JSON.parse(body);

        User.update(userData,{where:{id:user_id}})
        .then(result => {          
           var new_token = new BuyToken({
                walletMethod:'USD',
                buyHash:result1.data,
                amount,
                tokens:usdtokenvalue,
                user_id
            });
            new_token.save()
            .then(data => {
              if(data) {
                  res.status(201).json({
                    status:true,
                    message:"Payment sent successful"  
                  }); 
                }
            })
            .catch(err => {
                res.status(500).json({
                status:false,
                message:err.message
            });
          })
          return null;
        })
        .catch(err => {
          res.status(500).json({
            status: false,
            message: err.message
          });
        });
        }
       });
        } else {
           res.status(404).send({
             status: false,
             message: "No user Found"
          });
        }
      })
      .catch(err => {
        res.status(500).send({
         status: false,
         message: err.message
        });
      })
      }
    });    
  })  
  })
  .catch(err => {
    res.status(500).send({
         status: false,
         message: err.message
        });
      })
  },

  getUserKyc(req, res, next) {

    var user_id = req.userId;

    User.findOne({
       attributes: ["id","username","passport","drivingLicenceFront","drivingLicenceBack","addressProof"], 
          where : { id : user_id }
       })
      .then(data => {
          if(data){
            res.status(200).json({
              status:true,
              message:"All Your KYC's",
              data
            });
          } else {
            res.status(404).json({
              status:false,
              message:"No user Found"
            });
          }
      })
      .catch(err => {
        res.status(500).json({
              status:false,
              message:err.message
            })
      });
   },

}

