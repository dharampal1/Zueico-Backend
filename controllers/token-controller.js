import axios from 'axios';

module.exports = {

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
	createWallet(req, res, next){

	},
	getPrivateKey(req, res, next){

	},
	getBalance(req, res, next){

	},
	sendETH(req, res, next){

	},
	sendTokens(req, res, next){

	},
	checkApproval(req, res, next){

	},
	approveAddress(req, res, next){

	}
}