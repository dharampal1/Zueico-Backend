import axios from 'axios';
import request from 'request';
import { User } from '../models';
import { checkBlank } from '../helpers/requestHelper';
import {
  BuyToken,
  TokenTransfer
} from '../models';

import mdEncrypt from 'md5';

const  url = 'http://13.126.28.220:5000';

module.exports = {

	//get Requests

	getTokenDetails(req, res, next) {
		axios.get(`${url}/getTokenDetails`)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json({
		    		status:true,
		    		message:"Token Details",
		    		data:response.data
		    	});
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	getICOstats(req, res, next) {
		axios.get(`${url}/getICOstats`)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json({
		    		status:true,
		    		message:"ico stats",
		    		data:response.data
		    	});
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	getICOdetails(req, res, next) {
		axios.get(`${url}/getICOdetails`)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json({
		    		status:true,
		    		message:"ico Details",
		    		data:response.data
		    	});
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	// post Requests 
    

    totalOrders(req, res, next){
    	var user_id = req.userId ;

    	BuyToken.findAll({
    		where: { user_id }
    	})
    	.then( data => {
    		if(data.length) {
    			

    			User.findOne({
    				where: { id: user_id }
    			})
    			.then(data1 => {

    				var tokens = data.map(token => {
		    		var data = {
		    			tokens  : token.purchaseToken,
		    			method  : token.walletMethod,
		    			date  :  token.createdAt,
		    			price :  token.amount,
		    			status: data1.status,
		    			comment:data1.comments,
		    		 };
		    			return data;
		    		});
    				
    				res.status(200).json({
		    		status:true,
		    		message:"All Orders",
		    		data:tokens
		    	 });
    		  })
    		} else {
    		 res.status(404).json({
	    		status:false,
	    		message:'no data found'
	    	 });
    		}
    	})
    	.catch(err => {
    	  res.status(500).json({
    		status:false,
    		message:err.meesage
    	 });
      })
    },

    //Total Token Transfer
    getTransferdTokens(req, res, next){
    	var user_id = req.userId ;
    	BuyToken.findAll({
    		where: { user_id }
    	})
    	.then( data => {
    		if(data.length) {
				res.status(200).json({
	    			status:true,
	    			message:"All Transfered Tokens",
	    			data:data,
	    		});
    		} else {
    		 res.status(404).json({
	    		status:false,
	    		message:'no data found'
	    	 });
    		}
    	})
    	.catch(err => {
    	  res.status(500).json({
    		status:false,
    		message:err.meesage
    	 });
      })
    },

	buyToken(req, res, next) {
	 
	  var  walletMethod = req.body.walletMethod,
		   amount = req.body.amount,
		   purchaseToken = req.body.purchaseToken,
	       user_id = req.userId,
	       mainValues = [walletMethod, amount, purchaseToken];

	   if(checkBlank(mainValues) === 0 ){
	   	    var new_token = new BuyToken({
	   	    	walletMethod,
				amount,
				purchaseToken,
				user_id
	   	    });

	   		new_token.save()
	   		 .then(data => {
	   		 	if(data) {
	   		 	  res.status(201).json({
		    		status:true,
		    		message:"order Placed",
		    		data
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
        	res.status(422).json({
    		status:false,
    		message:"walletMethod, amount, purchaseToken, are required"
    	});
       }
	
	},

	tokenTranfer(req, res, next) {

	  var  fromAddress = req.body.fromAddress,
		   toAddress = req.body.toAddress,
		   token = req.body.token,
	       user_id = req.userId,
	       mainValues = [fromAddress, toAddress, token];

	   if(checkBlank(mainValues) === 0 ){
	   
	   	User.findOne({
	   		where:{id:user_id}
	   	})
	   	.then(data => {
	   		if(data){

	   	   const body = {
		   	   	keystore:JSON.stringify(data.keystore),
		   	   	password:data.tokenPassword,
		   	   	fromAddress,
		   	   	toAddress,
		   	   	value:parseInt(token)
	   	   	};

	   	   sendTokens(body)
	   	   	.then(token => {
	   	   if(token.isValid === true ){
	   	   	var new_token = new TokenTransfer({
	   	    	fromAddress,
				toAddress,
				token,
				user_id
	   	    });
	   	   	  new_token.save()
	   		 .then(data => {
	   		 	if(data) {
	   		 	  res.status(200).json({
		    		status:true,
		    		message:"Token Transfer",
		    		data:token.body
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
	   	   		res.status(500).json({
		    		status:false,
		    		message:"Token Tranfer Failed"
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
		    		message:"No user found"
		    	});
	   		}
	   	})
	   	
        } else {
        	res.status(422).json({
    		status:false,
    		message:"fromAddress, toAddress, token are required"
    	});
       }
	 
	},

	getPrivateKey(req, res, next){

		var user_id = req.userId;

		User.findOne({
	   		where : { id : user_id }
	   	})
	   	.then(data => {
	   		if(data){

	   	 const body = {
	   	     keystore:JSON.stringify(data.keystore),
	   	     password:data.tokenPassword,
	   	     address:data.ethWalletAddress
	   	 };

       
	  request.post({url:`${url}/getPrivateKey`, form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 		res.status(200).json({
	  	 			status:true,
	  	 			message:"Your PrivateKey",
	  	 			data:body
	  	 		});
	  	 	}
	  	 });
	  } else {
	   		  res.status(404).json({
	  	 	   	  status:false,
	  	 	   	  message:"no user found"
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

	getBalance(req, res, next){

	    var user_id = req.userId;

	   	User.findOne({
	   		where : { id : user_id }
	   	})
	   	.then(data => {
	   		if(data){

	   	 const body = {
	   	     keystore:JSON.stringify(data.keystore),
	   	     password:data.tokenPassword,
	   	     address:data.ethWalletAddress
	   	 };

	   request.post({url:`${url}/getBalance`,form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 		res.status(200).json({
	  	 			status:true,
	  	 			message:"Your token Balance",
	  	 			data:JSON.parse(body)
	  	 		});
	  	 	}
	  	 });
	   	} else {
	   		  res.status(404).json({
	  	 	   	  status:false,
	  	 	   	  message:"no user found"
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

	sendETH(req, res, next){

    var  fromAddress  = req.body.fromAddress,
		 toAddress = req.body.toAddress,
		 value = req.body.value,
		 user_id = req.userId,
         mainValues = [fromAddress,toAddress, value];

	  if(checkBlank(mainValues) === 0 ){		

	   	User.findOne({
	   		where:{id:user_id}
	   	})
	   	.then(data => {
	   		if(data){ 

   			const body = {
   				keystore:JSON.stringify(data.keystore),
   				password:data.tokenPassword,
   				fromAddress,
   				toAddress,
   				value
   			};

	   		request.post({url:`${url}/sendETH`, form:body },function(err,httpResponse,body){
		  	 	if(err){
		  	 	   res.status(500).json({
		  	 	   	  status:false,
		  	 	   	  message:err.message
		  	 	   });
		  	 	} else {
		  	 		var new_token = new TokenTransfer({
			   	    	fromAddress,
						toAddress,
						token:value,
						user_id
			   	    });
			   	   	  new_token.save()
			   		 .then(data => {
			   		 	if(data) {
			   		 	  res.status(200).json({
				    		status:true,
				    		message:"ETH Transfer",
				    		data:body
				    	});	
			   		 	}
			   		 })
			   		 .catch(err => {
			   		 	res.status(500).json({
				    		status:false,
				    		message:err.message
				    	});
			   		 })
		  	 	}
		  	    });

	   		} else {
	   			res.status(404).json({
		    		status:false,
		    		message:"No user found"
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
     	res.status(422).json({
    		status:false,
    		message:"fromAddress, toAddress, and value are required"
    	});
     }
	},
    checkApproval(req, res, next){

    	var address  = req.body.address;

	  if(address){	

		const body = {address};

    	 request.post({url:`${url}/checkApproval`,form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 		res.status(200).json({
	  	 			status:true,
	  	 			message:"Approval status",
	  	 			data:body
	  	 		});
	  	 	}
	  	 });
	  } else {
     	res.status(422).json({
    		status:false,
    		message:"address is required"
    	});
     }

	},

	approveAddress(req, res, next){

	 var address  = req.body.address;

	 if(address) {	

	 const body = {address};

	  request.post({url:`${url}/approveAddress`,form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
		  	 	res.status(200).json({
		  	 			status:true,
		  	 			message:"Address approved",
		  	 			data:body
		  	 	});
		  	  }
		  });
	   } else {
     	res.status(422).json({
    		status:false,
    		message:"address is required"
    	});
      }
    },

    totalRemainingToken(req, res, next) {

    	var user_id = req.userId ;

    	BuyToken.findAll({
    		where: { user_id }
    	})
    	.then( data => {
    		if(data.length){
    			TokenTransfer.findAll({
    				where: { user_id }
    			})
    			.then(data1 => {
    				if(data1.length){

					  var total = data.map(total => {
					  		return total.purchaseToken;
					  })

					 var transfer =  data1.map(transfer => {
					  		return transfer.token;
					  })

    				  var remain = total[0] - transfer[0] ;

    				  if(remain < 0 ){
    				  	return res.status(200).json({
					    		status:true,
					    		message:"All Remaining tokens",
					    		data:0
					    });
    				  }
    					
			    	   res.status(200).json({
					    		status:true,
					    		message:"All Remaining tokens",
					    		data:remain
					    });

    				} else {
    					 res.status(404).json({
				    		status:false,
				    		message:'no data found'
				    	 });
    				}
    			})
    			.catch(err => {
		    	  res.status(500).json({
		    		status:false,
		    		message:err.meesage
		    	 });
		      });
    			
    		} else {
    		 res.status(404).json({
	    		status:false,
	    		message:'no data found'
	    	 });
    		}
    	})
    	.catch(err => {
    	  res.status(500).json({
    		status:false,
    		message:err.meesage
    	 });
      });
    },

   totalUserbuytoken(req, res, next){
    	var user_id = req.userId ;

    	BuyToken.findAll({
    		where: { user_id }
    	})
    	.then( data => {
    		if(data.length){
    			res.status(200).json({
		    		status:true,
		    		message:"all buy tokens",
		    		data:data.map(token => {
		    			return token.purchaseToken;
		    		})
		    	 });
    		} else {
    		 res.status(404).json({
	    		status:false,
	    		message:'no data found'
	    	 });
    		}
    	})
    	.catch(err => {
    	  res.status(500).json({
    		status:false,
    		message:err.meesage
    	 });
      })
    }
}


function sendTokens(body) {
  return new Promise(((resolve, reject) => {
  
     request.post({url:`${url}/sendTokens`,form:body },function(err,httpResponse,body){
   
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