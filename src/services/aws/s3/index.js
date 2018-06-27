import request from 'request-promise'
export const getAllBuckets = function(client) {
  return new Promise((resolve, reject) => {
    client.listBuckets((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
}

export const createBucket = function(bucketname,client) {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: bucketname,
      ACL:"public-read"
    };
    client.createBucket(params, function(err, data) {
      if (err) reject(err);
      else resolve(data);
  })
})
}

export const deleteBucket = function(bucketname,client) {
  return new Promise((resolve, reject) => {
    var params = {
      Bucket: bucketname
    };
    client.deleteBucket(params, function(err, data) {
      if (err) reject(err);
      else resolve(data);
  })
})
}


export const getNumBuckets = function(client) {
  return new Promise((resolve, reject) => {
    client.listBuckets((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  })
}