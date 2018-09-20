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


exports.setVestigDuration = function(cliff, startTime, vestingDuration, interval) {

  console.log("hit duration");

  let body = { cliff, startTime, vestingDuration, interval};
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
                   cliff= moment(vesting_period_date).unix() ,
                   startTime =  moment(vesting_period_date).unix(),
                    vestingDuration = 8, // 8 months 
                    interval= 420;// 420sec = 7 min 2592000 seconds = 30 days

                    setVestigDuration(cliff, startTime, vestingDuration, interval);
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

}, 180000); //180000ms = 3 min
     
}


function vestingReleaseToken(){
   
 console.log("running vestingReleaseToken");
  var time = 420000; //2592000000 milisecod = 30 days
  var timesRun = 0;
  var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 8){
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
                  console.log("update");
                  if(i + 1 === users.length ) {

                      phasevesting();
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

    time = time + 60000; 

   }, time);
  }

function phasevesting() {

  console.log("called phase vesting");

  var time = 120000; //2592000000 milisecod = 30 days
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
    console.log(result,"phase release vested token contract"); 

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

      if(result.args.vestedTokensAddress === data1.User.ethWalletAddress && result.transactionHash === data1.relHash) {

       let RemainingTokens =  parseFloat(data1.RemainingTokens) - result.args.value.toNumber() / 10**18; 
       let VestedTokens =  parseFloat(data1.VestedTokens) + result.args.value.toNumber() / 10**18;

       PrivelegeUser.update({
           VestingPeriod:data1.VestingPeriod - 1,
           VestedTokens,
           RemainingTokens,
           relHash:null
        },{
            where: { [Op.and]: [{ user_id: data1.User.id },{ VestingPeriod: { [Op.gt]: 0 }}] }
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

