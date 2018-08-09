import axios from 'axios';
import cron from 'node-cron';
import Sequelize from 'sequelize';
import request from 'request';
import moment from 'moment';
import { 
   User,
   BuyToken, 
   PrivelegeUser,
   VestingTimes
} from '../models';

import { setVestigDuration } from '../helpers/socketHelper';
import config from './../config/environment';

const Op = Sequelize.Op;

const  url = config.gapi_url;


 moment.suppressDeprecationWarnings = true;

import vest_abi from './../config/vest_abi.json'

var veting_ContractAddress = config.veting_ContractAddress;

var Web3 = require("web3");
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(config.http_provider));

var vest_contract = web3.eth.contract(vest_abi).at(veting_ContractAddress);


 exports.getCurrentIco = function(socket) {

    cron.schedule('*/15 * * * * *', function(){
       console.log("running stats");

    axios.get(`${url}/getICOstats`)
      .then(response => {
        if(response.status === 200){

          var icoData = response.data.data;

          User.findAll({})
            .then(data => {
               if(data.length){

                  icoData.users = data.length;
                  socket.emit("currentStats", { data: icoData } ); // Emitting a new stats.
               }
            })
         }
      })
      .catch(err => {
          console.log(err);
      }); 
    });
    
}


exports.setVestigDuration = function(startTime, vestTime1, vestTime2, vestTime3, endTime) {

  console.log("hit duration");

  let body = { startTime, vestTime1, vestTime2, vestTime3, endTime};
      console.log(body,"body for add vest Duration");

       request.post({url:`${url}/setTokensVestingDuration`,form:body},function(err,httpResponse,body ){
          if(err){
            console.log(err, 'setTokensVestingDuration');
            return false;
          } else {
            let result = JSON.parse(body);

           if(result.status === true ) {
            console.log(result,"vesting duration");

              PrivelegeUser.update({
                vestHash:result.data
              },{
                where:{}
              })
              .then(data => {
                if(data){
                  vestingTokenAddress();
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
              console.log(result,"result duration");
             return false;
            }
           }
      });

}

function vestingTokenAddress() {

  console.log("in address");

  var timesRun = 0;
  var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }

  PrivelegeUser.findAll({
    include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ]
      })
      .then(users => {
        if(users.length){ 

          users.map((user,i) => {

             const body = { txhash:user.vestHash };

         request.post({url:`${url}/checkTxHash`, form:body },function(err,httpResponse,body ){
              if(err){
                console.log(err);
              } else {
                let result = JSON.parse(body);

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

                    if(i + 1 === users.length){

                      vestingReleaseToken();
                    }
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
        } else {
          if(user.vestStatus === 'Failed') {

             if(i + 1 === users.length){

                  var vesting_period_date = moment().format('LLLL'),
                     startTime   =  moment(vesting_period_date).add(5, 'm').unix(),
                     vestTime1   =  moment(vesting_period_date).add(10, 'm').unix(),
                     vestTime2   = moment(vesting_period_date).add(15, 'm').unix(),
                     vestTime3   = moment(vesting_period_date).add(20, 'm').unix(),
                     endTime = moment(vesting_period_date).add(25, 'm').unix();

                     setVestigDuration(startTime, vestTime1, vestTime2, vestTime3, endTime);
                 }
               }
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

}, 150000);
     
}


function vestingReleaseToken(){
   
 console.log("running vestingReleaseToken");
  var time = 420000;
  var timesRun = 0;
  var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 4){
          clearInterval(interval);
      }
   PrivelegeUser.findAll({
      where:{ vestAddressStatus:'Approved' }
     })
    .then(data => {
    if(data.length) {
      
     User.findAll({ where:{ previlege:'1' } })
      .then(users => {
       if(users.length){ 
        users.map((user,i) => {
          var vestingAddress = user.ethWalletAddress;

           const body = { vestingUserAddress:vestingAddress };

         request.post({url:`${url}/releaseVestedTokens`, form:body },function(err,httpResponse,body ){
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

                  if(i + 1 === users.length ) {

                    if(timesRun === 1){
                       phase1vesting();
                    } else if(timesRun === 2) {
                      phase2vesting();
                    } else if(timesRun === 3) {
                      phase3vesting();
                    } else if(timesRun === 4) {
                      phase4vesting();
                    } else {
                      return null;
                    }
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

    time = time + 360000;

   }, time);
  }


function phase1vesting(){

   var timesRun = 0;
   var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }

  var vestTokens1 = vest_contract.VestedTokensPhase1({},{fromBlock: "2400000", toBlock: 'latest'});
      
  vestTokens1.watch( (err, result) => {
     console.log(result,"phase1"); 
    PrivelegeUser.findAll({
     include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ]
      })
     .then(data => {
        if(data.length) {
          data.map(data1 => {

        if(result.args.vestedTokensAddress === data1.User.ethWalletAddress) {

         let RemainingTokens = data1.RemainingTokens - result.args.value.toNumber() / 10**18; 
         let VestedTokens = parseInt(data1.VestedTokens) + result.args.value.toNumber() / 10**18;
       
         PrivelegeUser.update({
             VestingPeriod:data1.VestingPeriod - 1,
             VestedTokens,
             RemainingTokens
          },{
              where: { user_id: data1.User.id }
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
 }, 150000);

}

function phase2vesting(){

   var timesRun = 0;
   var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }
  var vestTokens2 = vest_contract.VestedTokensPhase2({},{fromBlock: "2400000", toBlock: 'latest'});
      
  vestTokens2.watch( (err, result) => {
     console.log(result,"phase2"); 
    PrivelegeUser.findAll({
     include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ]
      })
     .then(data => {
        if(data.length) {
          data.map(data1 => {

         if(result.args.vestedTokensAddress === data1.User.ethWalletAddress) {

         let RemainingTokens = data1.RemainingTokens - result.args.value.toNumber() / 10**18; 
         let VestedTokens = parseInt(data1.VestedTokens) + result.args.value.toNumber() / 10**18;
       
         PrivelegeUser.update({
             VestingPeriod:data1.VestingPeriod - 1,
             VestedTokens,
             RemainingTokens
          },{
              where: { user_id: data1.User.id }
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
}, 150000);
}

function phase3vesting(){

   var timesRun = 0;
   var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }
  var vestTokens3 = vest_contract.VestedTokensPhase3({},{fromBlock: "2400000", toBlock: 'latest'});
      
  vestTokens3.watch( (err, result) => {
     console.log(result,"phase3"); 
     PrivelegeUser.findAll({
     include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ]
      })
     .then(data => {
        if(data.length) {
          data.map(data1 => {

         if(result.args.vestedTokensAddress === data1.User.ethWalletAddress) {

         let RemainingTokens = data1.RemainingTokens - result.args.value.toNumber() / 10**18; 
         let VestedTokens = parseInt(data1.VestedTokens) + result.args.value.toNumber() / 10**18;
       
         PrivelegeUser.update({
             VestingPeriod:data1.VestingPeriod - 1,
             VestedTokens,
             RemainingTokens
          },{
              where: { user_id: data1.User.id }
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
}, 150000);
}
function phase4vesting(){
   var timesRun = 0;
   var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 1){
          clearInterval(interval);
      }
  var vestTokens4 = vest_contract.VestedTokensPhase4({},{fromBlock: "2400000", toBlock: 'latest'});
      
  vestTokens4.watch( (err, result) => {
     console.log(result,"phase4"); 
    PrivelegeUser.findAll({
     include:[
         {
           model:User,
           attributes: ['id','ethWalletAddress'],
           group: ['user_id']
         }
        ]
      })
     .then(data => {
        if(data.length) {
          data.map(data1 => {

         if(result.args.vestedTokensAddress === data1.User.ethWalletAddress) {

         let RemainingTokens = data1.RemainingTokens - result.args.value.toNumber() / 10**18; 
         let VestedTokens = parseInt(data1.VestedTokens) + result.args.value.toNumber() / 10**18;
       
         PrivelegeUser.update({
             VestingPeriod:data1.VestingPeriod - 1,
             VestedTokens,
             RemainingTokens
          },{
              where: { user_id: data1.User.id }
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
 }, 150000);
}