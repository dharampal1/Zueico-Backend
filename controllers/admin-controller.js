import Sequelize from 'sequelize';
import request from 'request';
import { User, Admin, Setting, BuyToken, 
	     TokenTransfer, PrivelegeUser ,VestingTimes} from '../models';
import jwt from 'jsonwebtoken';
import { checkBlank } from '../helpers/requestHelper';
import { sendEmail } from '../helpers/userHelper';
import config from './../config/environment';
import { storage, csvFileFilter } from '../helpers/fileUpload';
const Op = Sequelize.Op;
const  url = 'http://13.126.28.220:5000';
import {
  hashPassword
} from '../helpers/userHelper';

import multer from 'multer';



module.exports = { 

  uploadPrivelgeUsers(req, res, next){

    var upload = multer({
       fileFilter:csvFileFilter,
       storage: storage
    }).single('Privelege_Users');

    upload(req, res, function(err) {
      if (err) {
          return res.status(500).json({
          status: false,
          message: err.message
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
		          return res.send("ok")
		      }
		     } else {

		     var newPrevUser = new PrivelegeUser({
		    		Name:data.Name,
					Email:data.Email,
					Phone:data.Phone,
					Country:data.Country,
					ICOTokens:data.ICOTokens,
					PreICOTokens:data.PreICOTokens,
					TotalPurchase:data.TotalPurchase,
					VestingPeriod:data.VestingPeriod,
					VestedTokens:data.VestedTokens,
					RemainingTokens:data.RemainingTokens
		    	});

		    	newPrevUser.save()
		    	 .then(user => {	 	
		    	 	hashPassword(data.Password)
		    	 	 .then(pass => {
		    	 	var new_user = new User({
		    	 		username:data.Name,
						email:data.Email,
						phone:data.Phone,
						password:pass,
						country:data.Country,
						emailVerified:true,
						previlege:1
		    	 	});
		    	 	sendEmail(data.Name,data.Email,data.Password)
		    	 	.then(data => {
		    	 		if(data.isValid === true){

			    	 	new_user.save()
			    	 	 .then(data1 => {
			    	 	   if( i + 1  === jsonObj.length){
			    	 	 		res.status(200).json({
					            status:true,
					            message: 'Privilege Users added and Login Deatails is sent to Email',
					          });
			    	 	 	}
			    	 	 })
			    	 	  .catch(err => {
				           res.status(500).json({
				             status:false,
				             message: err.message
				           });   
						})
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
				})
		       
		    })
		    .catch(err => {
		    	res.status(500).json({
		             status:false,
		             message: err.message
		          }); 
		      });
		}
		})
		.catch(err => {
			res.status(500).json({
	             status:false,
	             message: err.message
	          });   
		   })		
       });
    })
	.catch(err => {
		res.status(500).json({
	         status:false,
	         message: err.message
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
      ]
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
            	if(data.password === password) {
            		 var token = jwt.sign({
		                id: data.id
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
		User.findAll({
			where: { previledge : '1' }
		 })
		  .then(data => {
		  	  if(data){
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
	  	  		message:"Your Contact",
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
    // var user_id = req.body.user_id;
	 var vesting_period_date = req.body.vesting_period_date,
	     startTime  = new Date(vesting_period_date),
  	     vestTime1   = startTime.setDate(startTime.getDate() + 30),
  	     time1  = new Date(vestTime1),
         vestTime2   = time1.setDate(time1.getDate() + 30),
         time2 = new Date(vestTime2),
  	     vestTime3   = time2.setDate(time2.getDate() + 30),
         time3 = new Date(vestTime3),
         endTime = time3.setDate(time3.getDate() + 30),
         vestingAddress = '',
         tokenValue = '';

     PrivelegeUser.update({
    		vesting_period_date
    	})
    	.then(data => {
    		if(data){
		var newVestingTimes = new VestingTimes({
			vestTime1,
			vestTime2,
			vestTime3,
			endTime
		});

	newVestingTimes.save()
    .then(data1 => {
	  if(data1){
	    User.findAll({where:{previlege:'1'}})
	  	  .then((users,i) => {
	  	   if(users.length){ 
			PrivelegeUser.findAll({})
			  .then(vest => {
			  	 if(vest.length){
			  	  vest.map(vester => {
			  	  	tokenValue = vester.PreICOTokens;
			  	    users.map(user => {
	  	    		 vestingAddress = user.ethWalletAddress;

	  	    		 const body = {vestingAddress, tokenValue, startTime, vestTime1, vestTime2, vestTime3, endTime};	

					 request.post({url:`${url}/setVestingAddressDetails`,form:body},function(err,httpResponse,body ){
				        if(err){
				          return res.status(500).json({
				            status:false,
				            message:err.message
				          });
				        } else {

				        let result = JSON.parse(body);
				        
				            PrivelegeUser.update({
				            	vestHash:result.data
				            },{where:{id : vester.id}})
				            .then(data => {
				            	if(data){
				            	  if(i === users.length + 1 ){
				            	   res.status(200).json({
						  	  		 status:true,
						  	  		 message:'vesting Date Stored'
						  	  	   });
				            	 }
				            	} else {
				            	res.status(404).json({
						  	  		status:false,
						  	  		message:'NO vest Deatil Stored'
						  	  	});
				               }
				            })
				         }
				      });
	  	    		});
	  	    	  });
			  	 } else {
			  	 	res.status(404).json({
			  	  		status:false,
			  	  		message:'No Data Found'
				  	});
			  	 }
			  })
	    	} else {
	    		res.status(404).json({
		  	  		status:false,
		  	  		message:'No Data Found'
			  	});
	    	 }
	  	   })
	  	   .catch(err => {
	  	   	 res.status(500).json({
	  	  		status:false,
	  	  		message:err.message
	         });
	  	   })
		 } else {
		 		res.status(404).json({
		  	  		status:false,
		  	  		message:'No Data Found'
			  	 });
		 	}
		 })
		 .catch(err => {
    		res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	      });
    	});
	} else {
		res.status(404).json({
  	  		status:false,
  	  		message:'No Data Found'
  	  })
	}
   })
	.catch(err => {
		res.status(500).json({
	  		status:false,
	  		message:err.message
	      });
	});
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
	BuyToken.sum('tokens').then(sum => {
		resolve({sum});
	}).catch(err => {
		reject(err)
	});
}));
}

function sumOfTransferedTokens() {
	//token
	 return new Promise(((resolve, reject) => {
	TokenTransfer.sum('fromToken').then( sum =>  {
		resolve({sum});
	}).catch(err => {
		reject(err)
	});
	}));
}