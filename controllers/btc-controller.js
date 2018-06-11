import cron from 'node-cron';
import Web3 from "web3";
import request from 'request';
  

  var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899"));
// web3.eth.defaultAccount = (needed local geth accounts); //eg:web3.eth.accounts[0];

module.exports = {

   getCurrentPrice(req, res, next) {
     const url = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC,USD';

      request.get({url},function(err,httpResponse,body ){
        if(err){
          return res.status(500).json({
            status:false,
            message:err.message
          });
        } else {
           res.status(200).json({
            status:true,
            message:"current BTC and USD",
            data:JSON.parse(body)
          }); 
        }   
      });
   }
}
   
  
