import cron from 'node-cron';
import request from 'request';
 var schedule = require('node-schedule');
 import moment from 'moment';
 moment.suppressDeprecationWarnings = true;
import {
 User, Btc_price, 
 btc_transaction ,Refund, 
 BuyToken, TokenTransfer, PrivelegeUser,VestingTimes, Usd_transaction, 
 Referral_Bonus, Bonus } from '../models';
import Sequelize from 'sequelize';
import config from './../config/environment';
const Op = Sequelize.Op;

const url = 'http://zuenchain.io/user/transaction?Address=31uV49X3CysyAN2q2WDz9j1iAjxZtX6n5F';
const btc_url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';
const api_url = config.gapi_url;
import token_abi from './../config/token_abi.json'
import sale_abi from './../config/sale_abi.json'
import refund_abi from './../config/refund_abi.json'
import vest_abi from './../config/vest_abi.json'
import airdrop_abi  from './../config/airDrop_abi.json';


var Web3 = require("web3");
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(config.http_provider));

var sale_contract = web3.eth.contract(sale_abi).at(config.sale_ContractAddress);
var refund_contract = web3.eth.contract(refund_abi).at(config.refund_ContractAddress);
var airdrop_contract = web3.eth.contract(airdrop_abi).at(config.airdrop_ContractAddress);
var vest_contract = web3.eth.contract(vest_abi).at(config.veting_ContractAddress);

module.exports = {
   
  addVestingAddress() {
  cron.schedule('*/1 * * * *', function(){
 console.log("running vestaddress");
 PrivelegeUser.findAll({
    include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ],
       where:{ [Op.and]: [{ vestAddressStatus:'Pending' },{ vestAddressHash: null }] }
      })
      .then(users => {
        if(users.length){ 
          console.log(users,"skdf");

          users.map((user,i) => {

             const body = { txhash:user.vestHash };
             console.log(body,"khefjh");

         request.post({url:`${url}/checkTxHash`, form:body },function(err,httpResponse,body ){
              if(err){
                console.log(err);
              } else {
                let result = JSON.parse(body);

                console.log(result.data,"khvfjh");

             if(user.User.ethWalletAddress && result.data === 'Success'){

             let tokenValue = user.PreICOTokens;
             let vestingUserAddress = user.User.ethWalletAddress;
             let body = { vestingUserAddress, tokenValue }

             console.log(body,"body for add vest address");

            request.post({url:`${url}/setTokensVestingAddressDetails`,form:body},function(err,httpResponse,body ){
              if(err){
                console.log(err, 'setTokensVestingAddressDetails');
                return false;
              } else {

              let result = JSON.parse(body);

              console.log(result,"vesting result");
              if(result.status === true) {

                 PrivelegeUser.update({
                    vestAddressHash:result.data
                  },{
                    where:{ id : user.id }
                  })
                  .then(data => {
                    if(data){
                      console.log("add address");
                      return true;
                    } else {
                      return false;
                   }
                     return true;
                  })
                .catch(err => {
                  console.log(err);
                   return false;
                });
              } else {
                return false
                console.log(result,"result address");
              }
            }
          });
         } 
        }
      });
    });
    } else {
      return false;
    }
    return null;
  })
  .catch(err => {
    console.log(err);
     return false;
  });   
 });
},
	
   checkTxHashReferralBonus(){
	cron.schedule('*/1 * * * *', function(){
	     console.log("running refeStatus");

	    Referral_Bonus.findAll({
	     	where:{ refeStatus:'Pending' }
	     })
	      .then(data => {
	      	  if(data.length) {
	      	  	data.map(data1 => {
	      	  	 var refeHash = data1.refeHash;
	      	  	 const body = { txhash:refeHash };
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

			        	Referral_Bonus.update({
			        		refeStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated refeStatus");
			        	})
			        	.catch(err => {
			        		console.log(err,"refeStatus");
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

  checkTxHashBonus(){
	cron.schedule('*/1 * * * *', function(){
	     console.log("running BonusStatus");

	    Bonus.findAll({
	     	where:{ BonusStatus:'Pending' }
	     })
	      .then(data => {
	      	  if(data.length) {
	      	  	data.map(data1 => {
	      	  	 var BonusHash = data1.BonusHash;
	      	  	 const body = { txhash:BonusHash };
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

			        	Bonus.update({
			        		BonusStatus:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated BonusStatus");
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

	cron.schedule('*/2 * * * *', function(){
	  console.log("running cron for  event"); 


 BuyToken.findAll({
	 where: { tokenUpdateStatus:false },
     include:[
       {
           model:User,
           attributes: ['ethWalletAddress'],
           group: ['user_id']
       }
      ]
   })
    .then(data => {
  	  if(data.length){
  	  	data.map(hash => {

  	  	if(hash.User) {

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
		   });
		  }
		});
      }
	})
	.catch(err => {
		console.log(err,"err in buytoken");
	})
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
	     	where: { [Op.or]: [{ vestStatus:"Pending" }, { vestStatus : "Failed"}] }
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
  	cron.schedule('*/1 * * * *', function(){
	     console.log("running vest time release");

	   PrivelegeUser.findAll({
	     	 where: { [Op.or]: [{ relStatus:"Pending" }, { relStatus : "Failed"}] }
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
	  cron.schedule('*/2 * * * *', function(){
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
					amountInEther:result.args.value.toNumber() / 10**18,
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

  	cron.schedule('*/2 * * * *', function(){

  	console.log("running ReleasedAirDropTokens");

  	var airdrop = airdrop_contract.ReleasedAirDropTokens({},{fromBlock: "2400000", toBlock: 'latest'});
	    
	airdrop.watch( (err, result) => {

    //console.log(result,"ReleasedAirDropTokens"); 

  	 User.findAll({
        where: { [Op.and]: [{ previlege : '2' }, { airdrop_token_sent : 1 }]  }
       })
        .then(data => {
            if(data.length) {
               data.map((user,i) => { 

               if(result.args.releasedAirDropAddress === user.ethWalletAddress) {

               	BuyToken.update({
               		 tokenUpdateStatus:1,
                     tokens:result.args.value.toNumber()/ 10**18
               	},{
               		where: {  buyHash: result.transactionHash  } 
               	})
               	.then(buto => {
               		console.log("airdrop update");
               	})
               	.catch(err => {
               		console.log(err,"error in airdrop");
               	})
               }
             });
           }
           return true;
       })
       .catch(err => {
       	console.log(err,"relairdrop");
       });
	});

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


