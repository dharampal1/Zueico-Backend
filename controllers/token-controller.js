import axios from 'axios';
import request from 'request';
import {
  checkBlank
} from '../helpers/requestHelper';
import {
  BuyToken,
  TransferToken
} from '../models';

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


	buyToken(req, res, next) {
	 
	  var  walletMethod = req.body.walletMethod,
		   amount = req.body.amount,
		   purchaseToken = req.body.purchaseToken,
	       user_id = req.userId,
	       mainValues = [walletMethod, amount, purchaseToken];

	   if(checkBlank(mainValues) === 0 ){
	   	    var new_token = {
	   	    	walletMethod,
				amount,
				purchaseToken,
				user_id
	   	    };

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
		   token = req.body.purchaseToken,
	       user_id = req.userId,
	       mainValues = [fromAddress, toAddress, token];

	   if(checkBlank(mainValues) === 0 ){
	   	var new_token = {
	   	    	fromAddress,
				toAddress,
				token,
				user_id
	   	    };

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
    		message:"fromAddress, toAddress, token are required"
    	});
       }
	 
	},

	createWallet(req, res, next){
 
	   var password = req.body.password,
	       user_id = req.userId;

	   if(password){

	   const body = { password };
  
	  request.post({url:`${url}/createWallet`,form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 	res.status(200).send(body);
	  	 	}
	  	 });

	   } else {
	   	res.status(422).json({
    		status:false,
    		message:"password is required"
    	});
	   }
	 },

	getPrivateKey(req, res, next){

		 var password = req.body.password,
		     keystore = req.body.keystore;

	   const body = {keystore,password};

       
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
	},

	getBalance(req, res, next){

	 var password = req.body.password,
	     keystore = req.body.keystore,
	     address  = req.body.address,
	     mainValues = [password, keystore, address];

	   if(checkBlank(mainValues) === 0 ){

	   const body = {keystore,password,address};

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
     	res.status(422).json({
    		status:false,
    		message:"keystore, address, password is required"
    	});
     }

	},

	sendETH(req, res, next){

	 var password = req.body.password,
	     keystore = req.body.keystore,
	     fromAddress  = req.body.fromAddress,
		 toAddress = req.body.toAddress,
		 value = req.body.value,
         mainValues = [password, keystore, fromAddress,toAddress, value];

	  if(checkBlank(mainValues) === 0 ){		 

	 const body = {keystore,password,fromAddress, toAddress, value};

       request.post({url:`${url}/sendETH`, form:body },function(err,httpResponse,body){
	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 		res.status(200).json({
	  	 			status:true,
	  	 			message:"ETH sent",
	  	 			data:body
	  	 		});
	  	 	}
	  	 });
        } else {
     	res.status(422).json({
    		status:false,
    		message:"keystore, fromAddress, toAddress, password and value are required"
    	});
     }
	},

	sendTokens(req, res, next){

		var password = req.body.password,
		    keystore = req.body.keystore,
		    fromAddress  = req.body.fromAddress,
			toAddress = req.body.toAddress,
			value = req.body.value,
			mainValues = [password, keystore, fromAddress,toAddress,value];

	  if(checkBlank(mainValues) === 0 ){	

		const body = {keystore,password,fromAddress, toAddress, value};

       request.post({url:`${url}/sendTokens`,form:body },function(err,httpResponse,body){

	  	 	if(err){
	  	 	   res.status(500).json({
	  	 	   	  status:false,
	  	 	   	  message:err.message
	  	 	   });
	  	 	} else {
	  	 		res.status(200).json({
	  	 			status:true,
	  	 			message:"Tokens sent",
	  	 			data:body
	  	 		});
	  	 	}
	  	 });
        } else {
     	res.status(422).json({
    		status:false,
    		message:"keystore, fromAddress, toAddress, password and value are required"
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
    }
}




