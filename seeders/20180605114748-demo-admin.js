const bcrypt = require('bcryptjs');
const Promise = require('promise');

function hashpassword(password){
  return new Promise(((resolve, reject) => {
  bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error(err);
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
           console.error(err);
          } else {
            console.log(hash);
           resolve(hash)
          }
        });
      }
    });
 }));
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    let password = "admin",
        hash;
  
    return hashpassword(password)
      .then(pass => {
        console.log(pass);
        hash = pass;
         queryInterface.bulkInsert('Admins', [{
        username: 'admin',
        password: hash,
        phone: '1234567890',
        totalToken: '10',
        soldToken: '5',
        email: 'admin@gmail.com',
        createdAt: new Date(),
        updatedAt:  new Date()
      }], {});
      })
      .catch(err => {
        console.error(err);
      })
    
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Admins', null, {});
  }
};
