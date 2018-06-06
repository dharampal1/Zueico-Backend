import axios from 'axios';
import request from 'request';


module.exports = {

	//get Requests

	getTokenDetails(req, res, next) {
		axios.get('http://13.126.28.220:5000/getTokenDetails')
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	getICOstats(req, res, next) {
		axios.get('http://13.126.28.220:5000/getICOstats')
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	getICOdetails(req, res, next) {
		axios.get('http://13.126.28.220:5000/getICOdetails')
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},

	// post Requests 

	createWallet(req, res, next){
 
	   var password = req.body.password;

	
        var headers = {
            'Content-Type': 'application/json',
        }
  
	  request.post({url:'http://13.126.28.220:5000/createWallet', 
	  	 form:{password:'password'}},function(err,httpResponse,body){
	  	 	if(err){
	  	 	   res.status(500).json(err);
	  	 	} else {
	  	 		res.status(200).json({
	  	 			data:body
	  	 			
	  	 		});
	  	 	}
	  	 });


	  
	 },
	getPrivateKey(req, res, next){
		 var password = req.body.password,
		     keystore = req.body.keystore;

	   const body = {keystore,password};

       axios.get('http://13.126.28.220:5000/getPrivateKey',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},
	getBalance(req, res, next){
		 var password = req.body.password,
		     keystore = req.body.keystore,
		     address  = req.body.address;

		const body = {keystore,password,address};

       axios.get('http://13.126.28.220:5000/getBalance',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},
	sendETH(req, res, next){
		var password = req.body.password,
		    keystore = req.body.keystore,
		    fromAddress  = req.body.fromAddress,
			toAddress = req.body.toAddress,
			value = req.body.value;

		const body = {keystore,password,fromAddress, toAddress, value};
       axios.get('http://13.126.28.220:5000/sendETH',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},
	sendTokens(req, res, next){
		var password = req.body.password,
		    keystore = req.body.keystore,
		    fromAddress  = req.body.fromAddress,
			toAddress = req.body.toAddress,
			value = req.body.value;

		const body = {keystore,password,fromAddress, toAddress, value};

       axios.get('http://13.126.28.220:5000/sendTokens',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	},
    checkApproval(req, res, next){
    	var address  = req.body.address;

		const body = {address};

    	axios.get('http://13.126.28.220:5000/checkApproval',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 

	},
	approveAddress(req, res, next){

		var address  = req.body.address;

		const body = {address};

       axios.get('http://13.126.28.220:5000/approveAddress',body)
		  .then(response => {
		    if(response.status === 200){
		    	res.status(200).json(response.data)
		    } 
		  })
		  .catch(err => {
		  	res.status(500).json(err);
		  }); 
	}
}




