import cron from 'node-cron';
import request from 'request';
 var schedule = require('node-schedule');
import {
 User, Btc_price, 
 btc_transaction ,Refund, 
 BuyToken, TokenTransfer, PrivelegeUser,VestingTimes
  } from '../models';

const url = 'http://zuenchain.io/user/transaction?Address=15GUHDtq1NhnJQaaKXMt9uehZ8CRnvgBpc';
const btc_url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';
const api_url = 'http://13.126.28.220:5000';
import token_abi from './../config/token_abi.json'
 import sale_abi from './../config/sale_abi.json'
 import refund_abi from './../config/refund_abi.json'
// import vest_abi from './../config/vest_abi.json'

var refund_ContractAddress = '0x89306887d540b9b937814ed36c0c315a8908218d';
var sale_ContractAddress = '0x3164afeadb754210c077b723fb2c32106cf0df65';
var token_ContractAddress = '0x6806a1fb780173323ad41902539e12214ed3d994';

var Web3 = require("web3");
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899", 0, "shamuser", "shamtest@123"));

var token_contract = web3.eth.contract(token_abi).at(token_ContractAddress);
var sale_contract = web3.eth.contract(sale_abi).at(sale_ContractAddress);
var refund_contract = web3.eth.contract(refund_abi).at(refund_ContractAddress);

module.exports = {

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
               console.log(err)
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
			   	  	console.log("update tokens");
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
	 cron.schedule('*/30 * * * *', function(){
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

					  	    var pasedCoin=JSON.parse(body);
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
			        	console.log(result);
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
			        	console.log(result);
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

   	Refund.findAll({})
   	 .then(data => {
   	 	 if(data.length){
   	 	 	data.map(ref => {
   	 	 		console.log(ref.refStart);
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
   
   vestingTime1HashStatus(){
  	cron.schedule('*/30 * * * *', function(){
	     console.log("running vest time");

	   VestingTimes.findAll({
	     	where:{ vestTime1Hash:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var vestTime1Hash = data1.vestTime1Hash;
		          const body = { txhash:vestTime1Hash };
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
			        	VestingTimes.update({
			        		vestTime1Hash:new_status
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
    vestingTime2HashStatus(){
  	cron.schedule('*/30 * * * *', function(){
	     console.log("running vest time");

	   VestingTimes.findAll({
	     	where:{ vestTime2Hash:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var vestTime2Hash = data1.vestTime2Hash;
		          const body = { txhash:vestTime2Hash };
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
			        	VestingTimes.update({
			        		vestTime2Hash:new_status
			        	},{
			        		where: { id : data1.id}
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
			        	})
			          }
			          else {
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

    vestingTime3HashStatus(){

  	cron.schedule('*/30 * * * *', function(){
	     console.log("running vest time");

	   VestingTimes.findAll({
	     	where:{ vestTime3Hash:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var vestTime3Hash = data1.vestTime3Hash;
		          const body = { txhash:vestTime3Hash };
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
			        	VestingTimes.update({
			        		vestTime3Hash:new_status
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

    endTimeHashStatus(){
  	cron.schedule('*/30 * * * *', function(){
	     console.log("running vest time");

	   VestingTimes.findAll({
	     	where:{ vestTimeHash1:'Pending' }
	     })
	    .then(data => {
		  if(data.length) {
	      	  	data.map(data1 => {
	      	  	  var endTimeHash = data1.endTimeHash;
		          const body = { txhash:endTimeHash };
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
			        	VestingTimes.update({
			        		endTimeHash:new_status
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

   manageVestCron(){
   	cron.schedule('*/59 * * * *', function(){
	     console.log("running vest times");

	     var date = new Date().getTime();

	     VestingTimes.findAll({})
	       .then(data => {
	       	if(data.length){
	       	  data.map(data1 => {
	       	  	  if(data1.vetingTime1 === date){
	       	  	  	vestingReleaseToken1(date,3,data1.id);
	       	  	  } else if(data1.vetingTime2 === date){
	       	  	  	vestingReleaseToken2(date,2,data1.id);
	       	  	  } else if (data1.vetingTime3 === date){
	       	  	  	vestingReleaseToken3(date,1,data1.id);
	       	  	  } else {
	       	  	  	vestingReleaseToken4(date,0,data1.id);
	       	  	  }
	       	  });
	       	} else {
	       		console.log("no data found");
	       	}
	       })
	       .catch(err => {
	       	console.log(err);
	       })
	   });
   },

   vestingReleaseToken1(date, VestingPeriod, id ){

    User.findAll({where:{previlege:'1'}})
	    .then((users,i) => {
	  	if(users.length){ 
	  		users.map(user => {
	  			var vestingAddress = user.ethWalletAddress;

	  			 const body = { vestingAddress };

				 request.post({url:`${api_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        	VestingTimes.update({
			        		vestTimeHash1:result.data,
			        		VestingPeriod
			        	},{
			        		where: { id }
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
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
  },

   vestingReleaseToken2(date, VestingPeriod, id){
    
    User.findAll({where:{previlege:'1'}})
	    .then((users,i) => {
	  	if(users.length){ 
	  		users.map(user => {
	  			var vestingAddress = user.ethWalletAddress;

	  			 const body = { vestingAddress };

				 request.post({url:`${api_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        	VestingTimes.update({
			        		vestTime2Hash:result.data,
			        		VestingPeriod
			        	},{
			        		where: { id }
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
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
  },

   vestingReleaseToken3(date, VestingPeriod, id){

    User.findAll({where:{previlege:'1'}})
	    .then((users,i) => {
	  	if(users.length){ 
	  		users.map(user => {
	  			var vestingAddress = user.ethWalletAddress;

	  			 const body = { vestingAddress };

				 request.post({url:`${api_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        	VestingTimes.update({
			        		vestTime3Hash:result.data,
			        		VestingPeriod
			        	},{
			        		where: { id }
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
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
  },

   vestingReleaseToken4(date, VestingPeriod, id){

    User.findAll({where:{previlege:'1'}})
	    .then((users,i) => {
	  	if(users.length){ 
	  		users.map(user => {
	  			var vestingAddress = user.ethWalletAddress;

	  			 const body = { vestingAddress };

				 request.post({url:`${api_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
			        if(err){
			          console.log(err);
			        } else {
			        	let result = JSON.parse(body);
			        	if(result.status === true) {

			        	VestingTimes.update({
			        		endTimeHash:result.data,
			        		VestingPeriod
			        	},{
			        		where: { id }
			        	})
			        	.then(stat => {
			        		console.log("updated");
			        	})
			        	.catch(err => {
			        		console.log(err);
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
  },
  getRefund(socket) {

    cron.schedule('*/1 * * * *', function(){
       console.log("running refund");

   var refund = refund_contract.RefundsEnabled({}, {fromBlock: "2400000", toBlock: 'latest'});
             var refuser =  refund_contract.Refunded();

             console.log(refuser,"user refun");
        console.log(refund,"refund");

        if(refund){

           socket.emit("refundData", { data: refund } ); 
        }   
 });   
},

  setCurrentPrice() {

  	cron.schedule('*/1 * * * *', function(){

  		console.log("ruuning set price");

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

			        	console.log(body);

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

                  console.log("price is updated on network");

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
  }
   
}


function refundCron(){

	cron.schedule('*/1 * * * *', function(){
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
			        	console.log(result);
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
