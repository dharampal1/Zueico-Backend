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

  let body = { startTime, vestTime1, vestTime2, vestTime3, endTime};
      console.log(body,"body for add vest Duration");

       request.post({url:`${url}/setTokensVestingDuration`,form:body},function(err,httpResponse,body ){
          if(err){
            console.log(err, 'setTokensVestingDuration');
            return false;
          } else {
            let result = JSON.parse(body);

           if(result.status === true ) {

              PrivelegeUser.update({
                vestHash:result.data
              },{
                where:{}
              })
              .then(data => {
                if(data){
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
             return false;
            }
           }
      });

}

exports.vestingTokenAddress = function() {

  User.findAll({ where:{ previlege:'1' } })
      .then(users => {
        if(users.length){ 
          PrivelegeUser.findAll({})
            .then(vest => {
            if(vest.length){
              vest.map(vester => {
                tokenValue = vester.PreICOTokens;
                users.map((user,i) => {
               if(user.ethWalletAddress){
               vestingUserAddress = user.ethWalletAddress;
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
                      where:{}
                    })
                    .then(data => {
                      if(data){
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
                  return false;
                 }
               }
              });
             } else {
               return false;
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
      } else {
        return false;
       }
       return null;
     })
      .catch(err => {
        console.log(err);
         return false;
    });
}