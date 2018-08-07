import cron from 'node-cron';
import request from 'request';
 var schedule = require('node-schedule');
 import moment from 'moment';
 moment.suppressDeprecationWarnings = true;
import {
 User, Btc_price, 
 btc_transaction ,Refund, 
 BuyToken, TokenTransfer, PrivelegeUser,VestingTimes, Usd_transaction
  } from '../models';

 import { setVestigDuration, vestingTokenAddress } from '../helpers/socketHelper';

//const url = 'http://zuenchain.io/user/transaction?Address=15GUHDtq1NhnJQaaKXMt9uehZ8CRnvgBpc';
const url = 'http://zuenchain.io/user/transaction?Address=31uV49X3CysyAN2q2WDz9j1iAjxZtX6n5F';
const btc_url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';
const api_url = 'http://13.126.28.220:5000';
import token_abi from './../config/token_abi.json'
import sale_abi from './../config/sale_abi.json'
import refund_abi from './../config/refund_abi.json'
import vest_abi from './../config/vest_abi.json'
import  airdrop_abi  from './../config/airDrop_abi.json';

var refund_ContractAddress = '0xba0619b9c8e99b1748a3462f4cb05b6b243db3a2';
var sale_ContractAddress = '0x3164afeadb754210c077b723fb2c32106cf0df65';
var token_ContractAddress = '0x6806a1fb780173323ad41902539e12214ed3d994';
var veting_ContractAddress = '0x87947af95826a42d16928b5cba6201f26ac99d23';
var airdrop_ContractAddress = '0xeddc650bcba054015810aa93077ef41878b8af3d';

var Web3 = require("web3");
var web3 = new Web3();
//web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899", 0, "shamuser", "shamtest@123"));

web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899"));

var token_contract = web3.eth.contract(token_abi).at(token_ContractAddress);
var sale_contract = web3.eth.contract(sale_abi).at(sale_ContractAddress);
var refund_contract = web3.eth.contract(refund_abi).at(refund_ContractAddress);
var vest_contract = web3.eth.contract(vest_abi).at(veting_ContractAddress);
var airdrop_contract = web3.eth.contract(airdrop_abi).at(airdrop_ContractAddress);

module.exports = {

	updateTotalPurchase(){

		cron.schedule('*/30 * * * *', function(){
	     console.log("running Total Purchase");


	    PrivelegeUser.findAll({})
	      .then(data => {
	      	  if(data.length) {
	      	  	 data.map((user,i) => {

	      	  	  var TotalPurchase = parseInt(user.ICOTokens) + parseInt(user.PreICOTokens);

	  				PrivelegeUser.update({TotalPurchase},{
	  					where: { id : user.id }
	  				})
 				    .then(data1 => {
 				    	 if(data1){
 				    	 	console.log('TotalPurchase updated');
 				    	 }
 				    	 return null;
 				    })
 				    .catch(err => {
 				    	console.log(err,"error in update TotalPurchase");
 				    });
	      	  	 });
	      	  	 return null;
	      	  } else {
	      	  	console.log("no data found");
	      	  }
			})
	        .catch(err => {
	        	console.log(err,"error in total purchase");
	        })
	    });
	},

	updateApproveAddress(){

		cron.schedule('*/5 * * * *', function(){
	     console.log("running approve address");

	    User.findAll({
	     	where:{ previlege:'1' }
	     })
	      .then(data => {
	      	  if(data.length) {
	      	  	 data.map((user,i) => {

	      	  	 	 if(user.ethWalletAddress){

		      	  	var address = user.ethWalletAddress;
		       	  	const body = { address };

			     request.post({url:`${api_url}/approveAddress`,form:body },function(err,httpResponse,body){
			  	 	if(err){
			  	 	 console.log(err);
			  	 	} else {

			  	 	  let result = JSON.parse(body);

			  	 	  var walletHash = result.data;

			          if(result.status === true){
			  	 		User.update({
			  	 			walletHash
			  	 		},{
			  	 			where: { id : user.id}
			  	 		})
			  	 		.then(data1 => {
			  	 		  console.log('update walletHash');
			  	 		})
			  	 		.catch(err => {
			  	 			console.log(err,"error update walletHash ");
			  	 		});
	      	  	 	 } else {
	      	  	 	 	console.log('result');
	      	  	 	 }
	      	  	 	}
	      	  	 });
	      	  }
			})
	      }
	    })
        .catch(err => {
        	console.log(err,"error in approve address");
        });
      });
	},

	cronForTransfer(){

	cron.schedule('*/1 * * * *', function(){
	  console.log("running cron for  event"); 

 BuyToken.findAll({
	 where: { tokenUpdateStatus:false },
     include:[
       {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
       }
      ]
   })
    .then(data => {
  	  if(data.length){

  	  	data.map(hash => {

  	  	var blockNumber = "2400000";
	    var buyerAddress = hash.User.ethWalletAddress;

		var purchaseEvent = sale_contract.Purchase({ buyer:buyerAddress }, {fromBlock: blockNumber, toBlock: 'latest'});
			purchaseEvent.watch(function(err, result){

			if(err){
               console.log(err,"jhvj")
			} else {
			  var tokens = result.args.tokens.toNumber() / 10**18;
			   BuyToken.update({
			     	tokens,
			     	tokenUpdateStatus: 1
			   },{
			   	  where:{ buyHash : result.transactionHash}
			   })
			   .then(data1 => {
			   	  if(data1){
			   	  	 return true; 
			   	  }
			   })
              }
		   })
		});
      }
	});
   });
  },

	BTC_Tranctions(){
	 cron.schedule('*/1 * * * *', function(){
	     console.log("running btc");
      request.get({url},function(err,httpResponse,body ){
        if(err){
          console.log(err);
        } else {
	
         var result = JSON.parse(body);
         if(result.status === 1) {

         	User.findAll({})
         	  .then(data => {
	
     	  	  data.map(user => {
 	  	  	   result.data.map(trans => {
				console.log(user.btcWalletAddress === trans.sent_from,"chek btc");
 	  	  	 	 if(user.btcWalletAddress === trans.sent_from){
 	  	  	 	 	btc_transaction.findOne({
 	  	  	 	 		where: { hash : trans.hase_of_tx }
 	  	  	 	 	})
 	  	  	 	 	.then(data => {
					
 	  	  	 	 		if(!data) {
 	  	  	 	 		request.get(`${btc_url}`,function(err,httpResponse,body){
					  	 	if(err){
					  	 	 console.log(err);
					  	 	} else {

					   	  // console.log(httpResponse,"http");
						//console.log(httpResponse.body,"http");
 						var pasedCoin = JSON.parse(httpResponse.body);
						console.log(pasedCoin,"con");
						  var btc = pasedCoin.ETH.BTC,	
				                    usd = pasedCoin.ETH.USD,	
								ethbtcvalue = (1 / btc) * trans.amount,
								perTokenvalue= (1 / usd) * 0.60,
								tokensValue = ethbtcvalue / perTokenvalue,
								toAddress = user.ethWalletAddress;

						const body = { toAddress , value:tokensValue }		

                        request.post({url:`${api_url}/sendTokensBTCusers`,form:body },function(err,httpResponse,body){
                       if(err){
				  	 	 console.log(err);
				  	 	} else {

				  	   var result =JSON.parse(body);
						//console.log(result,"res1");

				  	    var newBuy = new BuyToken({
				  	    	amount:trans.amount,
				  	    	walletMethod:'BTC',
				  	    	buyHash:result.data,
				  	    	user_id:user.id,
				  	    	tokens:tokensValue
				  	    });

				  	    newBuy.save()
				  	     .then( buy => { return true })
				  	     .catch(err => { console.log(err) });

 	  	  	 	 		var newBTrans = new btc_transaction({
			         		hash:trans.hase_of_tx,
							from_address: trans.sent_from,
							to_address: trans.sent_to,
							amount: trans.amount,
							block_hight: trans.block_height,
							user_id: user.id
					   });

	 	  	  	 	 	newBTrans.save()
	 	  	  	 	 	 .then(data1 => {
	 	  	  	 	 	 	return true;
	 	  	  	 	 	 })
	 	  	  	 	 	 .catch(err => {
	 	  	  	 	 	 	console.log(err);
	 	  	  	 	 	 })

	 	  	  	 	 	}
	 	  	  	 	 });
 	  	  	 	 	   }
 	  	  	 	 	})
 	  	  	 	  }
 	  	  	    })
		 	   .catch(err => {
	  	 	 	 	console.log(err);
	  	 	 	})
	         	 }
	           });
		      });
		    })
		    .catch(err => {
		 	 	console.log(err);
		 	});
	     }   
	    } 
	  });
    });	  
  },

  USD_Tranctions(){
	 cron.schedule('*/1 * * * *', function(){
	    console.log("running USDt");
	     let USDTwalletAddress = '1QDwS9WwtCSTbSaegUjwnwctehpU4LuCdo';
	     const body  = { USDTwalletAddress };
       request.post({url:`${api_url}/getUSDTtransactions`,form:body },function(err,httpResponse,body ){
        if(err){
          console.log(err);
        } else {
	
         var result = JSON.parse(body);

         console.log(result, "usdt");
         if(result.status === true) {

         	User.findAll({})
         	  .then(data => {
	
     	  	  data.map(user => {

 	  	  	   result.data[0].transactions.map(trans => {
				console.log(user.USDTAddress === trans.sendingaddress,"chek usd");

 	  	  	 	 if(user.USDTAddress === trans.sendingaddress && trans.valid === true && trans.amount >= 90 ){
 	  	  	 	 	Usd_transaction.findOne({
 	  	  	 	 		where: { usd_hash : trans.txid }
 	  	  	 	 	})
 	  	  	 	 	.then(data => {
					
 	  	  	 	 		if(!data) {
 	  	  	 	 		
						
					 var usdtokenvalue = trans.amount / 0.60,
 					     toAddress = user.ethWalletAddress;

						const body = { toAddress , value:usdtokenvalue }		

                        request.post({url:`${api_url}/sendTokensUSDTusers`,form:body },function(err,httpResponse,body){
                       if(err){
				  	 	 console.log(err);
				  	 	} else {

				  	   var result =JSON.parse(body);
						//console.log(result,"res1");

				  	    var newBuy = new BuyToken({
				  	    	amount:trans.amount,
				  	    	walletMethod:'USDT',
				  	    	buyHash:result.data,
				  	    	user_id:user.id,
				  	    	tokens:usdtokenvalue
				  	    });

				  	    newBuy.save()
				  	     .then( buy => { return true })
				  	     .catch(err => { console.log(err) });

 	  	  	 	 		var newUSDTrans = new Usd_transaction({
			         		usd_hash:trans.txid,
							from_address: trans.sendingaddress,
							to_address: trans.referenceaddress,
							transaction_date:moment.unix(trans.blocktime).format(),
							amount: trans.amount,
							block_hight: trans.block,
							user_id: user.id,
							email:user.email
					   });
	 	  	  	 	 	newUSDTrans.save()
	 	  	  	 	 	 .then(data1 => {
	 	  	  	 	 	 	return true;
	 	  	  	 	 	 })
	 	  	  	 	 	 .catch(err => {
	 	  	  	 	 	 	console.log(err);
	 	  	  	 	 	 })

	 	  	  	 	 	}
	 	  	  	 	 });
 	  	  	 	  }
 	  	  	 	  return null
 	  	  	    })
		 	   .catch(err => {
	  	 	 	 	console.log(err);
	  	 	 	})
	         	 }
	           });
		      });
		      return null
		    })
		    .catch(err => {
		 	 	console.log(err);
		 	});
	     }   
	    } 
	  });
    });	  
 },


   checkTxHashWallet(){
	cron.schedule('*/1 * * * *', function(){
	     console.log("running wallet");

	    User.findAll({
	     	where:{ status:'Pending' }
	     })
	      .then(data => {
	      	  if(data.length) {
	      	  	data.map(data1 => {
	      	  	 var walletHash = data1.walletHash;
	      	  	 const body = { txhash:walletHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	console.log(result);
			        	if(result.status === true) {

			             var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }

			        	User.update({
			        		status:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated user");
			        	})
			        	.catch(err => {
			        		console.log(err,"wallet");
			        	})
			          }
			        }
	      	    });
	      	 });
			}
	      })
	      .catch(err => {
	      	console.log(err);
	      })
	});
  },

  checkTxHashBuy(){
	cron.schedule('*/1 * * * *', function(){
	     console.log("running buy");

	    BuyToken.findAll({
	     	where:{ buyStatus:'Pending' }
	     })
	      .then(data => {
	      	  if(data.length) {
	      	  	data.map(data1 => {
	      	  	 var buyHash = data1.buyHash;
	      	  	 const body = { txhash:buyHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

				          var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }

			        	BuyToken.update({
			        		buyStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err,"buy");
			        	})
			          } else {
			          	return null;
			          }
			        }
	      	    });
	      	 });
			}
	      })
	      .catch(err => {
	      	console.log(err);
	      })
	});
  },

  checkTxHashTrans(){

	cron.schedule('*/1 * * * *', function(){
	     console.log("running trans");

	   TokenTransfer.findAll({
	     	where:{ transStatus:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var transHash = data1.transHash;
		          const body = { txhash:transHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {
			        		var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }

			        	TokenTransfer.update({
			        		transStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err,"trans");
			        	})
			          } else {
			          	return null;
			          }
			        }
	      	    });
	      	 });
			}
		})
		.catch(err => {
			console.log(err);
		})
	});
  },

   refundTxHash(){

   	cron.schedule('*/1 * * * *', function(){
	     console.log("running refund hash");

   	Refund.findAll({})
   	 .then(data => {
   	 	 if(data.length){
   	 	 	data.map(ref => {
   	 	 		console.log(ref.refStart,"refund status");
   	 	 		 if(ref.refStart === true){
                    refundCron();
   	 	 		 }
   	 	 	});
   	 	 } else {
   	 	 	console.log("no data");
   	 	 }
   	 })
   	 .catch(err => {
   	 	console.log(err,"refund error");
   	 })
   	});
  },

  vestingDurationStatus(){
  	cron.schedule('*/2 * * * *', function(){
	     console.log("running vest Duration");

	   PrivelegeUser.findAll({})
	    .then(data => {
		  if(data.length) {  
		  	console.log(data[0].vestStatus,data[0].vestAddressStatus,"call address");
              
          if(data[0].vestStatus === 'Approved' && data[0].vestAddressStatus === 'Pending' || data[0].vestAddressStatus === "Failed" ) {
		         
		         console.log(data[0].vestStatus,"call address");
		       	vestingTokenAddress();
		          
	       } else if(data[0].vestStatus === 'Failed') {
	          
	          	VestingTimes.findAll({})
	          	 .then(data2 => {
	          	 	if(data2.length) {
	          	 	
      	 			let startTime = data2[0].startTime,
      	 			    vestTime1 = data2[0].vestTime1,
      	 			    vestTime2 = data2[0].vestTime2,
      	 			    vestTime3 = data2[0].vestTime3,
      	 			    endTime = data2[0].endTime;

      	 			    setVestigDuration(startTime, vestTime1, vestTime2, vestTime3, endTime);
	          	 	}
	          	 })
	          	 .catch(err => {
	          	 	console.log(err,"error in duration");
	          	 })
	          } else {
	          	return null;
	          }
		   }
		})
		.catch(err => {
			console.log(err);
		})
	});
  },

  vestingAddrressStatus(){
  	cron.schedule('*/1 * * * *', function(){
	     console.log("running vestingAddrressStatus");

	   PrivelegeUser.findAll({
	     	where:{ vestAddressStatus:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var vestAddressHash = data1.vestAddressHash;
		          const body = { txhash:vestAddressHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        		var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }
			        	PrivelegeUser.update({
			        		vestAddressStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated vestAddressStatus");
			        	})
			        	.catch(err => {
			        		console.log(err);
			        	})
			          } else {
			          	return null
			          }
			        }
	      	    });
	      	 });
			}
		})
		.catch(err => {
			console.log(err);
		})
	});
  	    
   },
 
  vestingHashStatus(){
  	cron.schedule('*/1 * * * *', function(){
	     console.log("running vest");

	   PrivelegeUser.findAll({
	     	where:{ vestStatus:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var vestHash = data1.vestHash;
		          const body = { txhash:vestHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        		var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }
			        	PrivelegeUser.update({
			        		vestStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
			        	})
			          } else {
			          	return null
			          }
			        }
	      	    });
	      	 });
			}
		})
		.catch(err => {
			console.log(err);
		})
	});
  	    
   },
   
   relHashHashStatus(){
  	cron.schedule('*/2 * * * *', function(){
	     console.log("running vest time release");

	   PrivelegeUser.findAll({
	     	where:{ relStatus:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var relHash = data1.relHash;
		          const body = { txhash:relHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        		var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }
			        	PrivelegeUser.update({
			        		relStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("relStatus updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
			        	})
			          } else {
			          	return null;
			          }
			        }
	      	    });
	      	 });
			}
		})
		.catch(err => {
			console.log(err);
		})
	});
  	    
   },

  getRefund(socket) {
	  cron.schedule('*/1 * * * *', function(){
	     console.log("running refund");

	 var refund = refund_contract.RefundsEnabled({}, {fromBlock: "2400000", toBlock: 'latest'});
	 var receivedTokensEvent = refund_contract.Refunded({},{fromBlock: "2400000", toBlock: 'latest'});
	          
	          receivedTokensEvent.watch(function(err, result){

	          	if(err) {
	          		console.error(err,"refund events error");
	          	} 

			    Refund.findOne({
			    	where: { refHash:result.transactionHash }
			    })
			    .then(data1 => {

			     if(!data1) {

			      console.log(result.args.value.toNumber(),result.args,"args" );

			     let new_refund = new Refund({
			    	userAddress:result.address,
					amountInEther:result.args.value.toNumber(),
					refHash:result.transactionHash,
					refStatus:'Pending'
			      });
			    
		    		 new_refund.save()
				      .then(refund => {

				      	 Refund.findAll()
				      	   .then(data2 => {
				      	   	  if(data2.length){
				      	   	  let refunds = data2.map(data3 => {
				      	   	  	 let new_data = {
					            	userAddress:data3.userAddress,
					            	amount:data3.amountInEther,
					            	txHash:data3.refHash,
					            	status:data3.refStatus
					             }
					             return new_data;
				      	   	  })
				      	   	  socket.emit("refundData", refunds); 

				      	   	  }
				      	   })
				      })
				      .catch(err => {
				      	console.error(err,"error in refund save");
				      })
			    	} else {
			    		 Refund.findAll()
				      	   .then(data2 => {
				      	   	  if(data2.length){
				      	   	  let refunds = data2.map(data3 => {
				      	   	  	 let new_data = {
					            	userAddress:data3.userAddress,
					            	amount:data3.amountInEther,
					            	txHash:data3.refHash,
					            	status:data3.refStatus
					             }
					             return new_data;
				      	   	  })
				      	   	  socket.emit("refundData", refunds); 

				      	   	  }
				      	   })
			    	}
			    })
	    }); 
	
	  });
},



  setCurrentPrice() {

  	cron.schedule('*/1 * * * *', function(){

  		console.log("running set price");

    const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

      request.get({url},function(err,httpResponse,body ){
        if(err){
           console.log(err,"setCurrentPrice");
        } else {

            var pasedCoin=JSON.parse(body);
            var btc = pasedCoin.ETH.BTC,
                usd = pasedCoin.ETH.USD;

            Btc_price.findOne({
              where:{ id : 1 }
            })
             .then(data => {

              if(data){
                var diff;

                if(data.USD > usd ){
                    diff = data.USD - usd ;
                } else {
                  diff = usd - data.USD ;
                }
                if(diff > 1 ){

                  Btc_price.update({
                  	USD:usd
                  },
                  {
                    where:{ id : 1 }
                  })
                  .then(price => {
                    if(price){

                     var ethervalue = (1 / usd) * 0.60;
                     let setvalue = ethervalue * 10**18;

                      const body = { price : setvalue};

                    request.post({url:`${api_url}/setPrice`,form:body }, function(err,httpResponse,body ){
			        if(err){
			           console.log(err,"setCurrentPrice on api");
			        } else {

                      console.log("price is updated on network and updated");
                     }
                   });

                    } else {
                      console.log(err, "not update data");
                    }
                  })
                  .catch(err => {
                     console.log(err, "eror");
                  });
                } else {
                  console.log("price uptodate");
                }
              } else {

               var ethervalue = (1 / usd) * 0.60;
               let setvalue = ethervalue * 10**18;

               const body = { price : setvalue};
                request.post({url:`${api_url}/setPrice`,form:body }, function(err,httpResponse,body ){
		        if(err){
		           console.log(err,"setCurrentPrice on api");
		        } else {

                  console.log("Price is updated on network");

                 }
               });

                  var newPrice = new Btc_price({
                      BTC:btc,
                      USD:usd,
                      ETH:ethervalue
                  });

                newPrice.save()
                .then(data1 => {
                   if(data1){
                      console.log("price is added in db");
                   } else {
                     console.log("not saved");
                   }
                })
                .catch(err => {
                    console.log(err, "eror while saving in db");
                })
              }
           });    
        }   
      });
    });
  },

  ReleasedAirDropTokens() {

  	cron.schedule('*/10 * * * *', function(){

  	console.log("running ReleasedAirDropTokens");

  	var airdrop = airdrop_contract.ReleasedAirDropTokens({fromBlock: "2400000", toBlock: 'latest'});
	    
	airdrop.watch( (err, result) => {

    console.log(result,"ReleasedAirDropTokens"); 

  	 User.findAll({
        where:{ previlege:'2' }
       })
        .then(data => {
            if(data.length) {
               data.map((user,i) => { 

               	BuyToken.update({
               		
                     tokens:result.args.value.toNumber()
               	},{
               		where: {  user_id:user.id }
               	})
               	.then(buto => {
               		console.log("airdrop update");
               	})
               	.catch(err => {
               		console.log(err,"error in airdrop");
               	})
               });
           }
       })
       .catch(err => {
       	console.log(err,"relairdrop");
       });
	});

   });
   
  },
   vestingReleaseToken(){

		let n = 0;
		let task = cron.schedule('*/5 * * * *', function(){

	  	console.log("running vestingReleaseToken");

	  	PrivelegeUser.findAll({
     	where:{ vestAddressStatus:'Approved' }
     })
    .then(data => {
	  if(data.length) {
	 
    User.findAll({ where:{ previlege:'1' } })
	    .then((users,i) => {
	  	 if(users.length){ 
	  		users.map(user => {
	  			var vestingAddress = user.ethWalletAddress;

	  			 const body = { vestingUserAddress:vestingAddress };

				 request.post({url:`${api_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) { 

			        	PrivelegeUser.update({
			        		relHash:result.data
			        	},{
			        		where: { user_id : user.id }
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        		n = n+1;	
			        		if(n == 1){
			        			setTimeout(phase1vesting(), 180000);
			        		} else if(n == 2) {
			        			setTimeout(phase2vesting(), 180000);
			        		} else if(n == 3) {
			        			setTimeout(phase3vesting(), 180000);
			        		} else if(n == 4) {
			        			setTimeout(phase4vesting(), 180000);
			        		} else {
			        			return null;
			        		}
							
			        	})
			        	.catch(err => {
			        		console.log(err);
			        	})
			         } else {
			         	console.log(result,"release token vested");
			         }
			       } 
			    });
	  		});
	      }
	    })
	    .catch(err => {
	   	  console.log(err);
	    });
	   }	
	  })
	 .catch(err => {
   	  console.log(err);
     });
	});

	if(n >= 4){
	 	task.stop();
	 } 
  },


  checkingVestTime() {

  	cron.schedule('*/2 * * * *', function(){

  	console.log("running checkingVestTime");
  	
  	 PrivelegeUser.findAll({
	     	where:{ vestAddressStatus:'Approved' }
	     })
	    .then(data => {
		  if(data.length > 0) {

		  	let curDate = moment().format('LLLL');
		  	let date = moment(curDate).unix();

		  	VestingTimes.find({})
			   .then(time => {

			 	let time1 = time[0].vestTime1,
			 	    time2 = time[0].vestTime2,
			 	    time3 = time[0].vestTime3,
			 	    time4 = time[0].endTime;

			 	if(time1 > date && time1 < time2){
			 		vestingReleaseToken()
			 	} else if(time2 > date && time2 < time3) {
			 		vestingReleaseToken()
			 	} else if(time3 > date && time3 < time4) {
			 		vestingReleaseToken()
			 	} else if(time4 > date) {
			 		vestingReleaseToken()
			 	} else {
			 		return null;
			 	}
			 })
			 .catch(err => {
			 	console.log(err,"error");
			 })    
		  } else {
		  	return null;
		  }
		})
		.catch(err => {
			console.log(err);
		})
  	});
  }
   
}



 

function refundCron(){

	cron.schedule('*/2 * * * *', function(){
	     console.log("running refund");

	   Refund.findAll({
	     	where:{ refStatus:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var refHash = data1.refHash;
		          const body = { txhash:refHash };
				 request.post({url:`${api_url}/checkTxHash`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {
			        		var new_status;
				          if(result.data == 'Success'){
					  	   	   new_status = 'Approved'
					  	   } else {
					  	     	new_status = result.data
					  	   }

			        	Refund.update({
			        		refStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated refund");
			        	})
			        	.catch(err => {
			        		console.log(err,"refund");
			        	})
			          } else {
			          	return null;
			          }
			        }
	      	    });
	      	 });
			}
		})
		.catch(err => {
			console.log(err);
		})
	});
};


function phase1vesting(){

	var vestTokens1 = vest_contract.VestedTokensPhase1({fromBlock: "2400000", toBlock: 'latest'});
	    
	vestTokens1.watch( (err, result) => {
	   console.log(result,"phase1"); 
	   PrivelegeUser.findAll({})
	   .then(data => {
	   	  if(data.length) {
	   	  	data.map(data1 => {

	   	  	   let RemainingTokens = data1.PreICOTokens - result.args.value.toNumber();	
			 
			   PrivelegeUser.update({
			   	   VestingPeriod,
			   	   VestedTokens:result.args.value.toNumber(),
			   	   RemainingTokens
			    },{
	        		where: { id: data1.id }
	        	})
			    .then(stat1 => {
	        		console.log("Pr User updated");
	        	})
	        	.catch(err => {
	        		console.log(err);
	        	})
	   	  	});
	   	  		
	   	  }
	   	  return true;
	   })
	   .catch(err => {
			console.log(err);
		})
	});
}
function phase2vesting(){
	var vestTokens1 = vest_contract.VestedTokensPhase1({fromBlock: "2400000", toBlock: 'latest'});
	    
	vestTokens1.watch( (err, result) => {
	   console.log(result,"phase2"); 
	   PrivelegeUser.findAll({})
	   .then(data => {
	   	  if(data.length) {
	   	  	data.map(data1 => {

	   	  	   let RemainingTokens = data1.PreICOTokens - result.args.value.toNumber();	
			 
			   PrivelegeUser.update({
			   	   VestingPeriod:data1.VestingPeriod - 1,
			   	   VestedTokens:result.args.value.toNumber(),
			   	   RemainingTokens
			    },{
	        		where: { id: data1.id }
	        	})
			    .then(stat1 => {
	        		console.log("Pr User updated");
	        	})
	        	.catch(err => {
	        		console.log(err);
	        	})
	   	  	});
	   	  		
	   	  }
	   	  return true;
	   })
	   .catch(err => {
			console.log(err);
		})
	});
}
function phase3vesting(){
	var vestTokens1 = vest_contract.VestedTokensPhase1({fromBlock: "2400000", toBlock: 'latest'});
	    
	vestTokens1.watch( (err, result) => {
	   console.log(result,"phase3"); 
	   PrivelegeUser.findAll({})
	   .then(data => {
	   	  if(data.length) {
	   	  	data.map(data1 => {

	   	  	   let RemainingTokens = data1.PreICOTokens - result.args.value.toNumber();	
			 
			   PrivelegeUser.update({
			   	   VestingPeriod:data1.VestingPeriod - 1,
			   	   VestedTokens:result.args.value.toNumber(),
			   	   RemainingTokens
			    },{
	        		where: { id: data1.id }
	        	})
			    .then(stat1 => {
	        		console.log("Pr User updated");
	        	})
	        	.catch(err => {
	        		console.log(err);
	        	})
	   	  	});
	   	  		
	   	  }
	   	  return true;
	   })
	   .catch(err => {
			console.log(err);
		})
	});
}
function phase4vesting(){
	var vestTokens1 = vest_contract.VestedTokensPhase1({fromBlock: "2400000", toBlock: 'latest'});
	    
	vestTokens1.watch( (err, result) => {
	   console.log(result,"phase4"); 
	   PrivelegeUser.findAll({})
	   .then(data => {
	   	  if(data.length) {
	   	  	data.map(data1 => {

	   	  	   let RemainingTokens = data1.PreICOTokens - result.args.value.toNumber();	
			 
			   PrivelegeUser.update({
			   	   VestingPeriod:data1.VestingPeriod - 1,
			   	   VestedTokens:result.args.value.toNumber(),
			   	   RemainingTokens
			    },{
	        		where: { id: data1.id }
	        	})
			    .then(stat1 => {
	        		console.log("Pr User updated");
	        	})
	        	.catch(err => {
	        		console.log(err);
	        	})
	   	  	});
	   	  		
	   	  }
	   	  return true;
	   })
	   .catch(err => {
			console.log(err);
		})
	});
}