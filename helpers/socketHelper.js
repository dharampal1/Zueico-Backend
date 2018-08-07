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

const  url = 'http://13.126.28.220:5000';


 moment.suppressDeprecationWarnings = true;

import vest_abi from './../config/vest_abi.json'

var veting_ContractAddress = '0x42a44e33752b7863d66f5980e2bbac835b7aa2c3';

var Web3 = require("web3");
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider("http://13.126.28.220:8899"));

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
                  setTimeout(function(){ vestingTokenAddress() } , 180000);
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

             if(user.User.ethWalletAddress && result.data == 'Success'){

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
                   setTimeout(function(){ vestingReleaseToken() } , 180000);
                      
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
        }
      }
    });
     });
    } else {
      return false;
    }
  })
  .catch(err => {
    console.log(err);
     return false;
  });  
     
}


function vestingReleaseToken(){
   
 console.log("running vestingReleaseToken");
  var timesRun = 0;
  var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 5){
          clearInterval(interval);
      }
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
                  if(timesRun === 1){
                    setTimeout(function(){ phase1vesting() } , 180000);
                  } else if(timesRun === 2) {
                    setTimeout(function(){ phase2vesting() }, 180000);
                  } else if(timesRun === 3) {
                    setTimeout(function(){ phase3vesting() }, 180000);
                  } else if(timesRun === 4) {
                    setTimeout(function(){ phase4vesting() }, 180000);
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
 
   }, 360000);
  }


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