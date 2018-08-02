var Web3 = require("web3");
var web3 = new Web3();
import request from 'request';
import {Btc_price, BuyToken, Admin, Refund} from '../models';
import token_abi from './../config/token_abi.json'
import sale_abi from './../config/sale_abi.json'
import refund_abi from './../config/refund_abi.json'
import vest_abi from './../config/vest_abi.json'
import {
  checkBlank
} from '../helpers/requestHelper';


//var token_ContractAddress = '0x6806a1fb780173323ad41902539e12214ed3d994';
var sale_ContractAddress = '0x3164afeadb754210c077b723fb2c32106cf0df65';
//var refund_ContractAddress = '0xba0619b9c8e99b1748a3462f4cb05b6b243db3a2';
//var veting_ContractAddress = '0x224b52bca2224fd4ba14c1a88fb5704d05a1e6b2';
//var veting_ContractAddress = '0xb408939cc7f65031067b5e2c129d7143baceaf42';
//var veting_ContractAddress = '0x6a9a6922095308854650bb542303c8b6effe8a9c';

// Token: 0x6806a1fb780173323ad41902539e12214ed3d994
// TokenSale: 0x3164afeadb754210c077b723fb2c32106cf0df65
// Refund: 0x89306887d540b9b937814ed36c0c315a8908218d
// TokenVesting: 0xc971e6bbdade0a3e2b85aec31d08697ca845b4e7
web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899", 0, "shamuser", "shamtest@123"));
//web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899"));
//var web3 = new Web3(new Web3.providers.HttpProvider("http://13.126.28.220:8899"));
// web3.eth.defaultAccount = '0x8b6091f3e23e6bfbcdf255c2895f12ce58629e64';

//var token_contract = web3.eth.contract(token_abi).at(token_ContractAddress);
var sale_contract = web3.eth.contract(sale_abi).at(sale_ContractAddress);
// var refund_contract = web3.eth.contract(refund_abi).at(refund_ContractAddress);
// var vest_contract = web3.eth.contract(vest_abi).at(veting_ContractAddress);


module.exports = {

   refund(req, res, next){

    const  url = 'http://13.126.28.220:5000';
    
     request.get({url:`${url}/enableRefundsForUser`},function(err,httpResponse,body){
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

    const get_url = 'http://13.126.28.220:5000/getPricePerToken';

      request.get({url:get_url},function(err,httpResponse,body ){
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
     const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

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

     const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

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
   


  
