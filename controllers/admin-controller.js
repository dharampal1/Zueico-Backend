import Sequelize from 'sequelize';
import { Users, Admin } from '../models';
import jwt from 'jsonwebtoken';
import { checkBlank } from '../helpers/requestHelper';
import config from './../config/environment';

const Op = Sequelize.Op;

module.exports = { 

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
		Users.findAll({
			where: { previledge : '0' }
		 })
		  .then(data => {
		  	  if(data){
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
		Users.findAll({
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

		var user_id  = req.userId ;

		Users.findAll({
			 attributes: ["id","username","passport","drivingLicenceFront","drivingLicenceBack","addressProof"], 
		  })
		  .then(data => {
		  	  if(data){
		  	  	console.log(data);
		  	  	res.status(200).json({
		  	  		status:true,
		  	  		message:"All KYC",
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
		var user_id  = req.userId,
		    status = req.body.status;

		if(status){

		 Users.update({
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

		} else {
			res.status(422).json({
	  	  		status:false,
	  	  		message:"Send Valid Params",
	  	  		required:'status'
		  	 });
		} 
	 },

	rejectKyc(req, res, next) {
		var user_id  = req.userId,
		    status = req.body.status;

		if(status){

		 Users.update({
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
		  	  		message:"Kyc Rejected",
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

		} else {
			res.status(422).json({
	  	  		status:false,
	  	  		message:"Send Valid Params",
	  	  		required:'status'
		  	 });
		} 
	}
}