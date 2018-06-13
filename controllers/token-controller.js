import axios from 'axios';
import request from 'request';
import { User } from '../models';
import { checkBlank } from '../helpers/requestHelper';
import {
  BuyToken,
  TokenTransfer
} from '../models';
import Sequelize from 'sequelize';

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
		    		data:response.data.data
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
		    		data:response.data.data
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
		    		data:response.data.data
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
		    			tokens  : token.tokens,
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
    	TokenTransfer.findAll({
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
		   tokens = req.body.purchaseToken,
	       user_id = req.userId,
	       txhash = '',
           status = '',
           userAddress = '',
	       mainValues = [walletMethod, amount, tokens];

	   if(checkBlank(mainValues) === 0 ){

	   	User.findOne({
	   		where:{id:user_id}
	   	})
	   	.then(user =>{
	   		if(user){
	   		    userAddress = user.ethWalletAddress;
	   		var new_token = new BuyToken({
	   	    	walletMethod,
				amount,
				tokens,
				user_id,
				txhash,
				status,
				userAddress
	   	    });

	   		new_token.save()
	   		 .then(data => {
	   		 	if(data) {
	   		 	  res.status(200).json({
		    		status:true,
		    		message:"order Placed successfully",
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
	   			 res.status(404).json({
		    		status:false,
		    		message:"No user Found",
		    	});	
	   		}
	   	})
	   	.catch(err =>{
	   		 res.status(500).json({
		    		status:false,
		    		message:err.message,
		    	});	
	   	});
	   	   
        } else {
        	res.status(422).json({
    		status:false,
    		message:"walletMethod, amount, tokens, are required"
    	});
       }
	
	},

	tokenTranfer(req, res, next) {

	  var  fromAddress = req.body.fromAddress,
		   toAddress = req.body.toAddress,
		   token = req.body.token,
	       user_id = req.userId,
	       totalTokens= 0,
	       toToken = 0,
		   fromToken = 0,
		   txhash,
           status,
	       mainValues = [fromAddress, toAddress, token];

	   if(checkBlank(mainValues) === 0 ){
	   
	   	User.findOne({
	   		where:{id:user_id}
	   	})
	   	.then(data => {
	   		if(data){

	   	   const body = {
		   	   	keystore:JSON.stringify(data.keystore),
		   	   	Password:data.tokenPassword,
		   	   	fromAddress,
		   	   	toAddress,
		   	   	value:parseInt(token)
	   	   	};

	   	   sendTokens(body)
	   	   	.then(token => {
	   	   if(token.isValid === true ){
	   	   	var result  = token.body; 
	   	   	sumOfBoughtTokens(user_id)
	   	   	  .then(total => {

   	   	      toToken = token;
   	   	  	  totalTokens = total.sum;
   	   	  	  fromToken = totalTokens - toToken;
   	   	  	  txhash = result.txhash;
   	   	  	  status =result.status;


	   	   	var new_token = new TokenTransfer({
	   	    	fromAddress,
				toAddress,
				toToken,
				fromToken,
				totalTokens,
				user_id,
				txhash,
				status
	   	    });
	   	   	 new_token.save()
	   		 .then(data => {
	   		 	if(data) {
	   		 	 return  res.status(200).json({
		    		status:true,
		    		message:"Token Transfer",
		    		data:token.body
		    	});	
	   		 	}
	   		 })
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

	  	 		var result = JSON.parse(body);

	  	 		if(result.status === true){
	  	 		  res.status(200).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
	  	 		});
	  	 	  } else {
	  	 	  	 res.status(422).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
	  	 		});
	  	 	  }
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
	  	 		var result = JSON.parse(body);

	  	 		if(result.status === true){
	  	 		  res.status(200).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
	  	 		});
	  	 	  } else {
	  	 	  	 res.status(422).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
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

  sendETH(req, res, next){

    var  fromAddress  = req.body.fromAddress,
		 toAddress = req.body.toAddress,
		 value = req.body.value,
		 user_id = req.userId,
		 hash = '',
         txstatus = '',
         totalTokens= 0,
	     toToken = 0,
		 fromToken = 0,
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

	  	 		var result = JSON.parse(body);

	  	 		if(result.status === true){ 
						

				sumOfBoughtTokens(user_id)
		   	   	  .then(total => {

	   	   	      fromToken = value;
	   	   	  	  totalTokens = total;
	   	   	  	  toToken = totalTokens - fromToken;
	   	   	  	  hash = result.txhash;
	   	   	  	  txstatus = result.status;
						
		  	 		var new_token = new TokenTransfer({
			   	    	fromAddress,
						toAddress,
						totalTokens,
						toToken,
						fromToken:value,
						user_id,
						hash,
						txstatus
			   	    });
			   	   	  new_token.save()
			   		 .then(data => {
			   		 	if(data) {
			   		 	  res.status(200).json({
				    		status:true,
				    		message:result.message,
				    		data:result.data
				    	});	
			   		   }
			   		 })
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
				    		message:result.message
				    	});
			   		}
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

	  	 		var result = JSON.parse(body);

	  	 		if(result.status === true){
	  	 		  res.status(200).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
	  	 		});
	  	 	  } else {
	  	 	  	 res.status(422).json({
	  	 			status:result.status,
	  	 			message:result.message,
	  	 			data:result.data
	  	 		});
	  	 	  }
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
    	var user_id = req.userId,
    	    total_tokens = 0,
    	    trans_token = 0;

    	sumOfBoughtTokens(user_id)
    	.then(buy => {
	    	sumOfTransferedTokens(user_id)
	    	 .then(trans => {
	    	 	trans_token = trans;
	    	 	total_tokens = buy ;

	    	let remain = total_tokens - trans_token;

	    	 res.status(200).json({
			    		status:true,
			    		message:"All Remaining tokens",
			    		data:remain
			    });
	    	 })
	    	 .catch(err => {
	    	 	res.status(500).json({
		    		status:false,
		    		message:err.message
		    	 });
	    	 });
    	})
    	.catch(err =>{
    		 res.status(500).json({
	    		status:false,
	    		message:err.message
	    	 });
    	});
    },

   totalUserbuytoken(req, res, next){

    	var user_id = req.userId ;

    	sumOfBoughtTokens(user_id)
    	.then( data => {

    		if(data){

    			res.status(200).json({
		    		status:true,
		    		message:"Total Tokens Purchased By You.",
		    		data
		    	 });
    		} else {
    		 res.status(404).json({
	    		status:false,
	    		message:'No User Found'
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
}


function sendTokens(body) {
  return new Promise(((resolve, reject) => {
  
     request.post({url:`${url}/sendTokens`,form:body },function(err,httpResponse,body){
   
	  	 	if(err){
	  	 	  reject(err)
	  	 	} else {
	  	 		
	  	 		var result = JSON.parse(body);

	  	 		console.log(result);

	  	 		if(result.status === true){
	  	 		  resolve({
	  	 			isValid:true,
	  	 			body:result.data
	  	 		})
	  	 	  } else {
	  	 	  	  reject(
	  	 	  	  	new Error(result.message)
	  	 	  	  )
	  	 	  }
	  	 	}
	  	 });
  }));
}

function sumOfBoughtTokens(user_id) {
	 return new Promise(((resolve, reject) => {
	BuyToken.sum('tokens', {
		where: {
			user_id
		},
	}).then(sum => {
		console.log(typeof sum, sum);
		resolve(sum);
	}).catch(err => {
		reject(err)
	});
}));
}

function sumOfTransferedTokens(user_id) {
	//token
	 return new Promise(((resolve, reject) => {
	TokenTransfer.sum('fromToken', {
		where: {
			user_id
		},
	}).then( sum =>  {
		resolve(sum);
	}).catch(err => {
		reject(err)
	});
	}));
}