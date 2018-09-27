import Sequelize from 'sequelize';
import request from 'request';
import { Referral_Bonus,Bonus,User, Admin, Setting, BuyToken, 
	     TokenTransfer, PrivelegeUser ,VestingTimes,Refund, Usd_transaction} from '../models';
import jwt from 'jsonwebtoken';
import { checkBlank } from '../helpers/requestHelper';
import { releaseBonusTokens, releaseReferralBonusTokens, sendEmail, verifyPassword, sendAirdropEmail, airdropUsersTokens } from '../helpers/userHelper';
import { setVestigDuration } from '../helpers/socketHelper';
import config from './../config/environment';
import { storage, csvFileFilter } from '../helpers/fileUpload';
const Op = Sequelize.Op;
const  url = config.gapi_url;
import {
  hashPassword
} from '../helpers/userHelper';
import moment from 'moment';
 moment.suppressDeprecationWarnings = true;
import multer from 'multer';

module.exports = { 


sendBonusUsers(req, res, next) {
	releaseBonusTokens()
      .then(valid => {
      	 if(valid.isValid === true) {
      	 	 return res.status(200).json({
                status: true,
                message: 'Bonus is sent Successfully',
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

  AddReferralBonus(req, res, next) { 

     var refeWalletAddress= req.body.refeWalletAddress,
		 refeTokens= req.body.refeTokens,
         mainValues = [refeWalletAddress,refeTokens];

    if (checkBlank(mainValues) === 0) {
    var new_Referral_Bonus = new Referral_Bonus({
      refeWalletAddress,
      refeTokens
    });
    new_Referral_Bonus.save()
      .then(data => {
        if (data) {
          releaseReferralBonusTokens(data.id)
          .then(valid => {
          	 if(valid.isValid === true) {
          	 	 res.status(200).json({
		            status: true,
		            message: "Referral Bonus is saved and Released"
		        });
          	 }
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
	  } else {
	    res.status(422).json({
	      status: false,
	      message: "refeWalletAddress, refeTokens are required"
	    });
	  }
},

getReferralBonus(req, res, next) { 

    Referral_Bonus.findAll({})
      .then(data => {
	  	  if(data.length){
	  	  	res.status(200).json({
	  	  		status:true,
	  	  		message:"All ReferralBonus",
	  	  		data
	  	  	});
	  	  } else {
	  	  	res.status(404).json({
	  	  		status:false,
	  	  		message:"No ReferralBonus Found"
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

  getBonusUsers(req, res, next) {
  	 Bonus.findAll({})
		  .then(data => {
		  	  if(data.length){
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"All Bonus users",
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

  uploadBonus(req, res, next) {
    var upload = multer({
      fileFilter: csvFileFilter,
      storage: storage
    }).single('bonus_Users');

    upload(req, res, function(err) {
          if (err) {
            return res.status(500).json({
              status: false,
              message: err
            });
          }
          if (req.file) {
            const csvFilePath = req.file.path;
            const csv = require('csvtojson');
            csv()
              .fromFile(csvFilePath)
              .then(jsonObj => {

                jsonObj.map((data, i) => {

                  Bonus.findOne({
                      where: {
                        Email: data.Email
                      }
                    })
                    .then(puser => {
                      if (puser) {
                        if (i + 1 === jsonObj.length) {
                          return res.status(200).json({
                                status: false,
                                message: 'Email is Already added',
                           });
                        }
                      } else {
                        var new_user = new Bonus({
                          Name: data.Name,
                          Email: data.Email,
                          Phone: data.Phone,
                          Country:data.Country,
                          BonusTokens: data.BonusTokens,
                          BonusEthAddress: data.EthAddress
                        });

                        new_user.save()
                          .then(user => {
                            if (i + 1 === jsonObj.length) {
                              return res.status(200).json({
                                status: true,
                                message: 'Bonus Users added Successfully',
                              });
                            }
                          })
                          .catch(err => {
                            return res.status(500).json({
                              status: false,
                              message: err
                            });
                          })
                      }
                    })
                    .catch(err => {
                      return res.status(500).json({
                        status: false,
                        message: err
                      });
                    });
                });
              })
              .catch(err => {
                return res.status(500).json({
                  status: false,
                  message: err
                });
              });
          } else {
            return res.status(422).json({
              status: false,
              message: "No file is sent"
            });
         }
     });
   },

  checktoken(req, res, next) {
      let id = req.id;

      if(id) {
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

  sendEmailAirdrop(req, res, next) {

  	sendAirdropEmail()
      .then(data => {
      	if(data.isValid == true){
      		res.status(200).json({
      			status:true,
      			message:"Account Details Has been sent to Airdrop Users."
      		});
      	} else {
      		res.status(422).json({
      			status:false,
      			message:"Email Not sent"
      		});
      	}
      })
      .catch( err => {
      	 res.status(500).json({
      			status:false,
      			message:err.message
      	  });
      })
  },

  startAirdropTokens(req, res, next) {
     airdropUsersTokens()
     .then(data => {
     	if(data.isValid === true){
     		res.status(200).json({
      			status:true,
      			message:"Token Has been Provided to Airdrop uers"
      		});
     	} else {
     		res.status(422).json({
      			status:false,
      			message:"tokens not relesed"
      		});
     	}
     })
     .catch(err  => {
     	  res.status(500).json({
      			status:false,
      			message:err.message
      	  });
     })
  },

  uploadPrivelgeUsers(req, res, next){

    var upload = multer({
       fileFilter:csvFileFilter,
       storage: storage
    }).single('Privelege_Users');

    upload(req, res, function(err) {
      if (err) {
          return res.status(500).json({
          status: false,
          message: err
        });
      }
      if (req.file) {
      	const csvFilePath=req.file.path;
		const csv=require('csvtojson');
		csv()
		.fromFile(csvFilePath)
		.then(jsonObj => {

		    jsonObj.map((data,i) => {

		    PrivelegeUser.findOne({
		    	where: { Email:data.Email } 
		    })
		    .then(puser => {
		     if(puser){
		     	if( i + 1 === jsonObj.length){
		          return res.send("some eamils already taken")
		      }
		     } else {
		     	
		     	hashPassword(data.Password)
		    	 	 .then(pass => {

		    	 	var new_user = new User({
		    	 		username:data.Name,
						email:data.Email,
						phone:data.Phone,
						password:pass,
						country:data.Country,
						emailVerified:true,
						vestingToken:data.VestedTokens,
						previlege:'1'
		    	 	});
		    	 	
		    	 new_user.save()
		    	 .then(user => {
		    	  
	    	 			  var newPrevUser = new PrivelegeUser({
				    		Name:data.Name,
							Email:data.Email,
							Phone:data.Phone,
							user_id:user.id,
							Country:data.Country,
							ICOTokens:data.ICOTokens,
							PreICOTokens:data.PreICOTokens,
							TotalPurchase:data.TotalPurchase,
							VestingPeriod:data.VestingPeriod,
							VestedTokens:data.VestedTokens,
							RemainingTokens:data.RemainingTokens
				    	});

			    	 	newPrevUser.save()
			    	 	 .then(data1 => {
			    	 	   sendEmail(data.Name,data.Email,data.Password)
		    	 	      .then(data2 => {
		    	 	  	    if(data2.isValid === true){
		    
			    	 	   if( i + 1  === jsonObj.length){
			    	 	 	return res.status(200).json({
					            status:true,
					            message: 'Privilege Users added and Login Deatails is sent to Email',
					          });
			    	 	 	}
			    	 	 	} else {
				    	 	  	console.log("error is sending");
				    	 	 }
				    	 	 return true;
			    	 	 })
			    	 	  .catch(err => {
			    	 	  	console.log(err);
				          return res.status(500).json({
				             status:false,
				             message: err
				           });   
						})
		    	 	  return true;
		    	   })
		    	 	.catch(err => {
		    	 		console.log(err);
			          return res.status(500).json({
			             status:false,
			             message: err
			           });   
					});
					return true;
		    	 })
		    	 .catch(err => {
		           return res.status(500).json({
		             status:false,
		             message: err
		           });   
				})
		       return true;
		    })
		    .catch(err => {
		    	console.log(err);
		    	return res.status(500).json({
		             status:false,
		             message: err
		          }); 
		      });
		}
		return true;
		})
		.catch(err => {
			console.log(err);
			return res.status(500).json({
	             status:false,
	             message: err
	          });   
		   })		
       });
      return true;
    })
	.catch(err => {
		console.log(err);
	return	res.status(500).json({
	         status:false,
	         message: err
	      });   
	 })	
   }
});

  },
  allTrancations(req, res, next) {
    BuyToken.findAll({
    	include:[
       {
           model:User,
           attributes: ['id','username'],
           group: ['user_id']
}
      ],
order: [['createdAt', 'DESC']]
    })
      .then(data => {
      	 if(data.length) {
      	 	res.status(200).json({
            status:true,
            message: 'Total Transactions',
            data
          });
      	 } else {
      	 	res.status(404).json({
                status:false,
                message: 'No data Found',
              });
      	 }
      })
      .catch( err  => {
      	res.status(500).json({
	        status:false,
	        message: err.message,
	      });
      })
  },

  allUsersCount(req, res, next){
  	User.findAll({})
  	  .then(data => {
  	  	 if(data.length){
  	  	  res.status(200).json({
            status:true,
            message: 'Total Users Count',
            data:data.length
          });
  	  	 } else {
  	  	 	 res.status(404).json({
                status:false,
                message: 'No data Found',
              });
  	  	 }
  	  })
  },

  adminLogin(req, res, next) {

    var email = req.body.email,
        password = req.body.password,
        mainValues = [email, password];

    if (checkBlank(mainValues) === 0) {

        Admin.findOne({
            where: {
              email
            }
          })
          .then(data => {
            if (data) {
             verifyPassword(password, data)
              .then(result => {
                if (result.isValid === true) {
            		 var token = jwt.sign({
		                id: data.id,
		                email
		              }, config.SECRET, {
		                expiresIn: config.JWT_EXPIRATION
		              });

		              res.status(200).json({
		                status:true,
		                message: 'Authenticated, Token Attached',
		                token
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
	    } else {
	      res.status(422).json({
	        status:false,
	        message: 'No user Found'
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
        required: "email, password"
      });
    }
	},
	allUsers(req, res, next) {
		User.findAll({})
		  .then(data => {
		  	  if(data.length){
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"All Users",
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

	getUserPreviledge(req, res, next) {
	  PrivelegeUser.findAll({})
		  .then(data => {
		  	  if(data.length){
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"All privilege users",
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

	allKyc(req, res, next) {

		User.findAll({
			 attributes: ["id","username","status","createdAt","passport","drivingLicenceFront","drivingLicenceBack","addressProof"], 
		  },{
		  where : { 
		  	 [Op.or]: [{drivingLicenceFront: { [Op.ne] : null}}, {drivingLicenceBack:{ [Op.ne]  : null}}, 
		  	 {addressProof:{[Op.ne]  : null}}, {passport:{[Op.ne] :null}}]
		  	 }
		  })
		  .then(data => {
		  	  if(data){
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"All KYC's",
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

	approveKyc(req, res, next) {
		var user_id  = req.body.user_id;

	      User.findOne({
	     	where:{ id:user_id }
	       })
	       .then(data => {
	       	  	if(data) {
	      	  
	       	  	var address = data.ethWalletAddress;
	       	  	const body = { address };

			     request.post({url:`${url}/approveAddress`,form:body },function(err,httpResponse,body){
			  	 	if(err){
			  	 	 console.log(err);
			  	 	} else {

			  	 	  let result = JSON.parse(body);

			  	 	  var walletHash = result.data;

			          if(result.status === true){
			  	 		User.update({
			  	 			walletHash
			  	 		},{
			  	 			where: { id : data.id}
			  	 		})
			  	 		.then(user => {
			  	 			res.status(200).json({
					  	  		status:true,
					  	  		message:result.message
					  	  });
			  	 		})
			  	 		.catch(err => {
			  	 			res.status(500).json({
					  	  		status:false,
					  	  		message:err.message
					  	  });
			  	 		});
			  	 	  }
			  	 	}
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

	rejectKyc(req, res, next) {
		var user_id  = req.body.user_id,
		    status = req.body.status;

		if(user_id && status){

		 User.update({
			status
		 },{
			where : { id : user_id }
		 },{
		 	returning:true, 
		 	plain:true
		 })
		  .then(data => {
		  	  if(data){
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"Kyc Rejected"
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

		} else {
			res.status(422).json({
	  	  		status:false,
	  	  		message:"Send Valid Params",
	  	  		required:'status, user_id'
		  	 });
		} 
	},

	publicStripeKey(req, res, next) {

        var id = req.id;
        var publicStripeKey = req.body.publicStripeKey;
    	
    if(publicStripeKey) {

    	var publicStripeKey = req.body.publicStripeKey;

    	Admin.update({
    		publicStripeKey
    	},
    	{
    		where:{ id }
    	})
    	 .then(data => {
    	 	if(data){
	         	res.status(200).json({
	  	  		status:true,
	  	  		message:"publicStripeKey added",
	  	  		data
  	     	  });
	        } else {
	        	res.status(404).json({
	  	  		status:false,
	  	  		message:"No publicStripeKey found",
    	      });
	        }
	     })
    	 .catch(err => {
    	 	res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	  	})
     });   
     } else {
     	res.status(422).json({
  	  		status:false,
  	  		message:"publicStripeKey is required",
	      });
     }
	},

	stripeKey(req,res,next){
	  let id = 0;
	  var key = req.body.key,
	  	  type = req.body.type;

	  	  if(type==='live'){
	  	  	id = 2
	  	  }else{
	  	  	id = 1
	  	  }
		if( key&& type){

			var newSetting = {
				id,
				key,
				type
			};

			Setting.upsert(newSetting)
			 .then(data => {
			 	res.status(200).json({
		  	  		status:true,
		  	  		message:"Stripe key added"
		  	  	})
			 })
			 .catch(err => {
			 	res.status(500).json({
		  	  		status:false,
		  	  		message:err.message
		  	  	})
			 })
		}
	},

	getstripeKey(req,res,next){

	 Setting.findAll({})
	 .then(data => {
	 	res.status(200).json({
	  		status:true,
	  		message:"Stripe keys",
	  		data
	  	});
	 })
	 .catch(err => {
	 	res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	  	})
	 })
		
	},
    totalCoins(req, res, next) {
    	sumOfBoughtTokens()
    	 .then(data => {
    	 	res.status(200).json({
	  	  		status:true,
	  	  		message:"All Purchased Tokens",
	  	  		data:data.sum
  	     	})
    	 })
    	 .catch(err => {
    	 	res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	  	 })	
      });
    },

    remainingCoins(req, res, next) {

    	sumOfBoughtTokens()
    	 .then(data => {
    	  return sumOfTransferedTokens()
	         .then(data1 => {
	         	res.status(200).json({
	  	  		status:true,
	  	  		message:"All Remaining Tokens",
	  	  		data:data.sum - data1.sum
  	     	  })
	        })
    	 })
    	 .catch(err => {
    	 	res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	  	})
     });   
    },

    getContracts(req, res, next){
    	Admin.findOne({
    		where:{ id: 1 },
    		attributes: ['id','email','contract'],
    	})
    	 .then(data => {
    	 	if(data){
	         	res.status(200).json({
	  	  		status:true,
	  	  		message:"Admin contract",
	  	  		data
  	     	  });
	        } else {
	        	res.status(404).json({
	  	  		status:false,
	  	  		message:"No contract found",
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

    updateContract(req, res, next){
    	var id = req.id;
    	var contract = req.body.contract;

    	Admin.update({
    		contract
    	},
    	{
    		where:{ id }
    	})
    	 .then(data => {
    	 	if(data){
	         	res.status(200).json({
	  	  		status:true,
	  	  		message:"Update contract",
	  	  		data
  	     	  });
	        } else {
	        	res.status(404).json({
	  	  		status:false,
	  	  		message:"No contract found",
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

   addVestingDate(req, res, next) {

    if (req.body.vesting_period_date) {

      var vesting_period_date = moment().format('LLLL'),
        cliff = moment(vesting_period_date).unix(),
        startTime = moment(vesting_period_date).unix(),
        vestingDuration = 8, // 8 months 
        interval = 420; // 420sec = 7 min 2592000 seconds = 30 days

      PrivelegeUser.update({
          vesting_period_date: vesting_period_date
        }, {
          where: {}
        })
        .then(data => {
          console.log(data);
          if (data) {
            User.update({
                vestingStartDate: vesting_period_date
              }, {
                where: {
                  previlege: '1'
                }
              })
              .then(updat => {
                console.log(updat);
                if (updat) {

                  var newvest = new VestingTimes({
                    startTime,
                    cliff,
                    vestingDuration,
                    interval,
                  })

                  VestingTimes.find({})
                    .then(vestt => {
                      if (!vestt) {
                        newvest.save()
                          .then(vetTime => {

                            setVestigDuration(cliff, startTime, vestingDuration, interval);

                            return res.status(200).json({
                              status: true,
                              message: 'vesting Duration Initiated'
                            });
                          })
                          .catch(err => {
                            res.status(500).json({
                              status: false,
                              message: err.message
                            })
                          });
                      } else {
                        VestingTimes.update({
                            startTime,
                            cliff,
                            vestingDuration,
                            interval,
                          }, {
                            where: {}
                          })
                          .then(data1 => {
                            if (data1) {

                              setVestigDuration(cliff, startTime, vestingDuration, interval);

                              return res.status(200).json({
                                status: true,
                                message: 'vesting Duration Initiated'
                              });
                            } else {
                              res.status(404).json({
                                status: false,
                                message: 'No data found'
                              })
                            }
                          })
                          .catch(err => {
                            res.status(500).json({
                              status: false,
                              message: err.message
                            })
                          });
                      }
                    })
                    .catch(err => {
                      res.status(500).json({
                        status: false,
                        message: err.message
                      })
                    });


                } else {
                  res.status(404).json({
                    status: false,
                    message: 'No data found'
                  })
                }
                return null
              })
              .catch(err => {
                res.status(500).json({
                  status: false,
                  message: err.message
                })
              })
          } else {
            res.status(404).json({
              status: false,
              message: 'No data found'
            })
          }
          return null
        })
        .catch(err => {
          res.status(500).json({
            status: false,
            message: err.message
          })
        })
    } else {
      res.status(422).json({
        status: false,
        message: 'vesting_period_date is required'
      })
    }
  },
  
   usdtContribution(req, res, next) {
  	 BuyToken.count({ where: { walletMethod :'USDT' } })
       .then(data => {
         if(data > 0){
      BuyToken.sum('tokens',{ where: { walletMethod :'USDT' } })
      .then(sum => {
         res.status(200).json({
              status:true,
              message:"All USDT contributions",
              data:sum
            }); 
         return true;
       }) 
      .catch(err => {
        res.status(500).json({
            status:false,
            message:err.message
          }); 
       })
      } else {
           res.status(200).json({
              status:false,
              message:"No USDT Purchase Found"
            }); 
         }
          return true;
       }) 
       .catch(err => {
        res.status(500).json({
            status:false,
            message:err.message
          }); 
       })
  },


  usdContribution(req, res, next) {
  	 BuyToken.count({ where: { walletMethod :'USD' } })
       .then(data => {
         if(data > 0){
      BuyToken.sum('tokens',{ where: { walletMethod :'USD' } })
      .then(sum => {
         res.status(200).json({
              status:true,
              message:"All USD contributions",
              data:sum
            }); 
          return true;
       }) 
      .catch(err => {
        res.status(500).json({
            status:false,
            message:err.message
          }); 
       })
      } else {
           res.status(200).json({
              status:false,
              message:"No USD Purchase Found"
            }); 
         }
          return true;
       }) 
       .catch(err => {
        res.status(500).json({
            status:false,
            message:err.message
          }); 
       })
  }
}

function approveAddress(body){
  return new Promise(((resolve, reject) => {
    request.post({url:`${url}/approveAddress`,form:body },function(err,httpResponse,body){
	  	 	if(err){
	  	 	  reject(err)
	  	 	} else {
	 		resolve({
 				isValid:true,
	 			body
 			})
	  	 }
	  });
   }));
}

function sumOfBoughtTokens() {
	return new Promise(((resolve, reject) => {
    BuyToken.count()
	 .then(data => {
	 	 if(data > 0){
	BuyToken.sum('tokens').then(sum => {
		resolve({sum});
	}).catch(err => {
		reject(err)
	});
	} else {
	 	 	resolve({sum:0});

	 	 }
	 })	
	 .catch(err => {
	 	reject(err)
	 })
}));
}

function sumOfTransferedTokens() {
	 return new Promise(((resolve, reject) => {
	TokenTransfer.count()
	 .then(data => {
	 	 if(data > 0){
	TokenTransfer.sum('toToken').then( sum =>  {
		resolve({sum});
	}).catch(err => {
		reject(err)
	 });
	} else {
	 	 	resolve({sum:0});

	 	 }
	 })	
	 .catch(err => {
	 	reject(err)
	 })
	}));
}
