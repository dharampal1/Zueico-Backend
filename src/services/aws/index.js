var awscred = require('awscred');
export const loadCredentialsAndRegion = function() {
  return new Promise((resolve, reject) => {
    awscred.load(function(err, data) {
      if (err) reject(err);
      resolve(data);
    })
  })
}
