var Web3 = require("web3");
var web3 = new Web3();
import request from 'request';
import {Btc_price,VestingPeriod} from '../models';
import token_abi from './../config/abi.json'
import sale_abi from './../config/sale_abi.json'
import refund_abi from './../config/refund_abi.json'
import {
  checkBlank
} from '../helpers/requestHelper';


var token_ContractAddress = '0x8b6091f3e23e6bfbcdf255c2895f12ce58629e64';
var sale_ContractAddress = '0xdb34991aea9bb31b8a2a2758b54f0b49426b6c7f';
var refund_ContractAddress = '0xf5a84cad55a9d027fcd1c07fa98eb1241002f4d2';

var web3 = new Web3(new Web3.providers.HttpProvider("http://13.126.28.220:8899"));
// web3.eth.defaultAccount = '0x8b6091f3e23e6bfbcdf255c2895f12ce58629e64';

var token_contract = web3.eth.contract(token_abi).at(token_ContractAddress);
var sale_contract = web3.eth.contract(sale_abi).at(sale_ContractAddress);
var refund_contract = web3.eth.contract(refund_abi).at(refund_ContractAddress);


module.exports = {


  getCurrentPrice(req,res, next) {
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

                ethervalue = (1 / usd) * 0.60,
                btcvalue = ethervalue * btc,
                usdvalue = usd * 0.60,
                data = {
                  ethervalue,
                  btcvalue,
                  usdvalue
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
                  eth_raised,
                  btc_raised,
                  usd_raised
                };

           res.status(200).json({
            status:true,
            message:"current BTC and USD",
            data
          }); 
        }   
      });
   },

    setCurrentPrice(req, res, next) {

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
                    where:{id:1}
                  })
                  .then(price => {
                    if(price){

                     var ethervalue = (1 / usd) * 0.60;
                     var setvalue = ethervalue * 10**18;

                      sale_contract.setPrice(setvalue);



                       res.status(200).json({
                        status:true,
                        message:"Price is updated"
                      }); 
                    } else {
                       res.status(404).json({
                        status:false,
                        message:"no data updated"
                      }); 
                    }
                  })
                  .catch(err => {
                     res.status(500).json({
                        status:false,
                        message:err.message
                      }); 
                  });
                } else {
                   res.status(200).json({
                        status:true,
                        message:"Price is uptodate"
                      }); 
                }
              } else {

               var ethervalue = (1 / usd) * 0.60;
               var setvalue = ethervalue * 10**18;

               sale_contract.setPrice(setvalue);

                  var newPrice = new Btc_price({
                      BTC:btc,
                      USD:usd
                  });

                newPrice.save()
                .then(data1 => {
                   if(data1){
                     res.status(200).json({
                      status:true,
                      message:"Price is set",
                      data:data1
                    }); 
                   } else {
                     res.status(404).json({
                        status:false,
                        message:"no data saved"
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
        }   
      });
   },


 
}
   


  
