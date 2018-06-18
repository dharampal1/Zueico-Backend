 import Promise from 'promise';
 import bcrypt from 'bcryptjs';
 import { User } from '../models';
 import request from 'request';
import config from './../config/environment';
import nodemailer from 'nodemailer';
import path from 'path';
import  hbs from 'nodemailer-express-handlebars';
import mdEncrypt from 'md5';

const  url = 'http://13.126.28.220:5000';


 exports.verifyToken = function(token, user) {
  return new Promise(((resolve, reject) => {
    if (token === user.emailVerifyToken) {
      resolve({
        isValid: true,
        id: user.id
      });
    } else {
      reject(new Error("Verification token is Invalid"));
    }
  }));
}


exports.hashPassword = function(password) {

  return new Promise(((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  }));
}

exports.verifyPassword = function(password, user) {
  return new Promise(((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          isValid: result,
          id: user.id
        });
      }
    });
  }));
}

exports.createWallet = function(email, user) {
  return new Promise(((resolve, reject) => {


     var password = mdEncrypt(email);
       
     const body = { password };

     console.log(password);
  
    request.post({url:`${url}/createWallet`,form:body },function(err,httpResponse,body){

        if(err){
          console.log(err,"api gras");
           reject(err);
        } else {

          var result = JSON.parse(body);
          console.log(result);

          if(result.status === true){

            var ethWalletAddress = result.data.addr[0],
                keystore = JSON.parse(result.data.keystore);

            User.update({
              ethWalletAddress,
              keystore:keystore,
              tokenPassword:password,
            },{
              where: { id:user.id},
              returing:true,
              plain:true
            })
            .then(data => {
              if(data){
                resolve({
                  isValid: true
                });
              } else {
               reject(new Error("No user Found"));
              }
            })
            .catch(err => {
              reject(err)
            })
          } else {
            reject(
              new Error(result.message)
            )
         }
       }
    });
  }));
}

exports.approveAddress = function(address, user) {
  return new Promise(((resolve, reject) => {
       
     const body = { address };
  
     request.post({url:`${url}/approveAddress`,form:body },function(err,httpResponse,body){

        if(err){
           reject(err);
        } else {
            resolve({
              isValid: true,
              body
            });
        }
    });
  }));
}

exports.sendEmail = function(username,email,password) {

 return new Promise(((resolve, reject) => {
       
 let link = "https://zuenchain.io/user/login";
 var transporter = nodemailer.createTransport(config.smtpConfig);
                var handlebarsOptions = {
                    viewEngine: 'handlebars',
                    viewPath: path.resolve('./templates/'),
                    layoutsDir:path.resolve('./templates/'),
                    extName: '.hbs'
                  };

                 transporter.use('compile', hbs(handlebarsOptions));

                var data = {
                  from: `${config.smtpConfig.auth.user}`,
                  to: `${email}`,
                  template: 'privelege-user',
                  subject: 'Account Deatils Email',
                  context: {
                   email: email,
                   name: username,
                   password:password,
                   url:link
                  }
                };

                transporter.sendMail(data, (error) => {

                  if (error) {
                   reject(err);
                  } else {
                   resolve({
                      isValid: true,
                    });
                  }
             });

          }));

  }