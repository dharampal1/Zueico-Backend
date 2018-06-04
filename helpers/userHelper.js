 import Promise from 'promise';
 import bcrypt from 'bcryptjs';


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