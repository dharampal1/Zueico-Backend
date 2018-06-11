import Sequelize from 'sequelize';
import request from 'request';
import { User, Admin, Setting } from '../models';
import jwt from 'jsonwebtoken';
import { checkBlank } from '../helpers/requestHelper';
import config from './../config/environment';

const Op = Sequelize.Op;
const  url = 'http://13.126.28.220:5000';

module.exports = { 


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
		var user_id  = req.body.user_id,
		    status = req.body.status;

		User.findOne({
            where: {
              id:user_id
            }
        })
        .then(data => {
        	var address = data.ethWalletAddress;
        	if(address){
        		const body = { address };
        		approveAddress(body).then(address=>{
        			if(address.isValid === true ){
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
						  	  		message:"Kyc Approved",
						  	  		data: address.body
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
        			} 
        		})
        		 .catch(err => {
				  	res.status(500).json({
				  	  		status:false,
				  	  		message:err.message
				  	  	})
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
	  		message:"Stripe keys"
	  	});
	 })
	 .catch(err => {
	 	res.status(500).json({
  	  		status:false,
  	  		message:err.message
  	  	})
	 })
		
	},


	btcContribution(req, res, next){
   
		
	},

    ethContribution(req, res, next){

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