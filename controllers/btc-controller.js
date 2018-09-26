var Web3 = require("web3");
var web3 = new Web3();
import request from 'request';
import {User, Btc_price, BuyToken, Admin, Refund, PrivelegeUser, VestingTimes} from '../models';
import token_abi from './../config/token_abi.json'
import sale_abi from './../config/sale_abi.json'
import refund_abi from './../config/refund_abi.json'
import vest_abi from './../config/vest_abi.json'
import {
  checkBlank
} from '../helpers/requestHelper';
import config from './../config/environment';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

var veting_ContractAddress = config.veting_ContractAddress;
var Web3 = require("web3");
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(config.http_provider));

var vest_contract = web3.eth.contract(vest_abi).at(veting_ContractAddress);

var web3 = new Web3(new Web3.providers.HttpProvider(config.http_provider));

var sale_contract = web3.eth.contract(sale_abi).at(config.sale_ContractAddress);

const  get_url = config.gapi_url;

const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

module.exports = {

   setVestingAddress(req, res, next) {
      PrivelegeUser.findAll({
     include:[
       {
         model:User,
         attributes: ['id','ethWalletAddress'],
         group: ['user_id']
       }
      ],
       where:{ [Op.and]: [{ vestAddressStatus:'Approved' },{ VestedTokens: 0 }] }
     })
    .then(users => {
    if(users.length) {
        users.map((user,i) => {
          var vestingAddress = user.User.ethWalletAddress;

           const body = { vestingUserAddress:vestingAddress };

         request.post({url:`${get_url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
              if(err){
                 res.status(500).json({
                  status:false,
                  message:err.message
                });
              } else {
                let result = JSON.parse(body);
                if(result.status === true) { 
                  
                PrivelegeUser.update({
                  relHash:result.data
                },{
                  where: { user_id : user.User.id }
                })
                .then(stat => { 
                 
                  if(i + 1 === users.length ) {

                    res.status(200).json({
                     status:true,
                     message:"vested token Released "
                    });
                      console.log("update rel hash");
                      phasevesting();
                 }
                })
                .catch(err => {
                    res.status(500).json({
                    status:false,
                    message:err.message
                  })
                })
               } else {
                  res.status(500).json({
                    status:false,
                    message:result.message
                  });
               }
             } 
          });
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


   refund(req, res, next){
    
     request.get({url:`${get_url}/enableRefundsForUser`},function(err,httpResponse,body){
        if(err){
          return res.status(500).json({
          status:false,
          message:err.message
          });
        } else {
          let result = JSON.parse(body);

          let new_refund = new Refund({
              refHash:result.data,
              refStart:1
          });

          new_refund.save()
            .then(data => {
            if(data){
              res.status(200).json({
                status:true,
                message:result.message
              });
                } else {
          res.status(400).json({
              status:false,
              message:"No Data Found For Refund"
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
  },


  getPricePerToken(req, res, next) {

    
      request.get({url:`${get_url}/getPricePerToken`},function(err,httpResponse,body ){
        if(err){
          console.log(err);
          return res.status(500).json({
            status:false,
            message:err.message
          });
        } else {

         var result = JSON.parse(body); 

         return res.status(200).json({
            status:true,
            message:result.message,
            data:result.data
          });
        }
      });
  },

  getCurrentPrice(req,res, next) {

      request.get({url},function(err,httpResponse,body ){
        if(err){
          return res.status(500).json({
            status:false,
            message:err.message
          });
        } else {
            //We need to Fetch Ether Value form getPricePerToken
            
            var pasedCoin=JSON.parse(body);

            var btc = pasedCoin.ETH.BTC,
                usd = pasedCoin.ETH.USD,

                ethervalue = (1 / usd) * 0.60,
                btcvalue = ethervalue * btc,
                usdvalue = 0.60,
                data = {
                  ethervalue:ethervalue.toString(),
                  btcvalue:btcvalue.toString(),
                  usdvalue:usdvalue.toString()
                };

           res.status(200).json({
            status:true,
            message:"current BTC and USD and ETH",
            data
          }); 
        }   
      });
  },

   contribuationStatistics(req, res, next) {

      request.get({url},function(err,httpResponse,body ){
        if(err){
          return res.status(500).json({
            status:false,
            message:err.message
          });
        } else {
            var pasedCoin=JSON.parse(body);
            var btc = pasedCoin.ETH.BTC,
                usd = pasedCoin.ETH.USD,
                eth_raised = sale_contract.ethRaised() * 10**18,
                btc_raised = eth_raised * btc,
                usd_raised = eth_raised * usd,
                data = {
                  eth_raised:eth_raised.toString(),
                  btc_raised:btc_raised.toString(),
                  usd_raised:usd_raised.toString()
                };

           res.status(200).json({
            status:true,
            message:"Rise in BTC and USD and ETH",
            data
          }); 
        }   
      });
   },

   btcContribution(req, res, next) {
      BuyToken.count({ where: { walletMethod :'BTC' } })
       .then(data => {
         if(data > 0){
      BuyToken.sum('amount',{ where: { walletMethod :'BTC' } })
      .then(sum => {
         res.status(200).json({
              status:true,
              message:"All btc contributions",
              data:sum
            }); 
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
              message:"No BTC Purchase Found."
            }); 
         }
       }) 
       .catch(err => {
        res.status(500).json({
            status:false,
            message:err.message
          }); 
       })
   },
  getBtcWallet(req, res, next){
    Admin.findOne({
        where:{ id: 1 },
        attributes: ['id','email','btcWalletAddress'],
      })
       .then(data => {
        if(data.btcWalletAddress){
            res.status(200).json({
            status:true,
            message:"Admin btcWalletAddress",
            data
            });
          } else {
            res.status(404).json({
            status:false,
            message:"No btcWalletAddress Added",
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
  updateBtcWallet(req, res, next){
      var id = req.id;
      var btcWalletAddress = req.body.btcWalletAddress;
     if(btcWalletAddress) {
      Admin.update({
        btcWalletAddress
      },
      {
        where:{ id },
        plain:true
      })
       .then(data => {
        if(data){
            res.status(200).json({
            status:true,
            message:"btcWalletAddress Added"
            });
          } else {
            res.status(404).json({
            status:false,
            message:"No btcWalletAddress saved",
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
        message:"btcWalletAddress is required",
    });
   }
 }
}

  function phasevesting() {

  console.log("called phase vesting");

  var time = 60000; 
  var timesRun = 0;
  var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }
  var vestTokens1 = vest_contract.VestedTokens({},{fromBlock: "2400000", toBlock: 'latest'});
      
  vestTokens1.watch( (err, result) => {
    if(err) {
     console.log(err,"phase release vested error"); 
    }
    //console.log(result,"phase release vested token contract"); 

  PrivelegeUser.findAll({
   include:[
       {
         model:User,
         attributes: ['id','ethWalletAddress'],
         group: ['user_id']
       }
      ],
      where:{ [Op.and]: [{ vestAddressStatus:'Approved' },{ VestedTokens: 0 }] }
    })
   .then(data => {
      if(data.length) {
        data.map(data1 => {

      if(result.args.vestedTokensAddress === data1.User.ethWalletAddress && result.transactionHash === data1.relHash) {

       let RemainingTokens =  parseFloat(data1.RemainingTokens) - result.args.value.toNumber() / 10**18; 
       let VestedTokens =  parseFloat(data1.VestedTokens) + result.args.value.toNumber() / 10**18;

       PrivelegeUser.update({
           VestedTokens,
           RemainingTokens,
           relHash:null
         },{
            where: { [Op.and]: [{ user_id: data1.User.id }] }
          })
        .then(stat1 => {
            console.log("Pr User updated");
          })
          .catch(err => {
            console.log(err);
          })
         }
        });   
      }
      return true;
   })
   .catch(err => {
    console.log(err);
  })
});
}, time); //180000ms = 3 min

};