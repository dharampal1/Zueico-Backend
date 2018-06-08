import { storage, imageFileFilter } from '../helpers/fileUpload';
import {
  User
} from '../models';
import Sequelize from 'sequelize';
import multer from 'multer';

const maxSize = 10000000 ;

const Op = Sequelize.Op;

module.exports = {


 uploadPassport(req, res, next){

    var user_id = req.userId;

    var upload = multer({   
      fileFilter: imageFileFilter,
      limits:{ fileSize : maxSize },
      storage: storage
    }).single('passport');

    upload(req, res, function(err) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err.message
        });
      }
      if (req.file) {
        User.findOne({
           where:{ id: user_id }
          })
          .then(data => {
            if (data) {
              User.update({
                  passport: req.file.path
                },{
                  where: {id : user_id}
                },{
                  returning: true,
                  plain:true
                })
                .then(result => {
                  res.status(200).json({
                    status: true,
                    message: `passport Uploaded`,
                  });
                });
                return null;
            } else {
              res.status(404).json({
                status: false,
                message: "No User Found"
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              error: err.message
            });
          });
      } else {
        res.status(422).json({
          status: false,
          message: "No file is sent in Request"
        });
      }
    });
 },

 uploadDrivingFront(req, res, next){
  var user_id = req.userId;

    var upload = multer({   
      fileFilter: imageFileFilter,
      limits:{ fileSize : maxSize },
      storage: storage
    }).single('drivingLicenceFront');

    upload(req, res, function(err) {

      if (err) {
        if(err.code ==='LIMIT_FILE_SIZE'){
          return res.status(500).json({
          status: false,
          message: "FIle size should be less than 10 mb"
        });
        } else {
           return res.status(500).json({
          status: false,
          message: err
        });
        }
      }
      if (req.file) {
        User.findOne({
           where:{ id: user_id }
          })
          .then(data => {
            if (data) {
              User.update({
                  drivingLicenceFront: req.file.path
                },{
                  where: {id : user_id}
                },{
                  returning: true,
                  plain:true
                })
                .then(result => {
                  res.status(200).json({
                    status: true,
                    message: `drivingLicenceFront Uploaded`,
                  });
                });
            } else {
              res.status(404).json({
                status: false,
                message: "No User Found"
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              error: err.message
            });
          });
      } else {
        res.status(422).json({
          status: false,
          message: "No file is sent in Request"
        });
      }
    });

 },
 uploadDrivingBack(req, res, next){
  var user_id = req.userId;

    var upload = multer({   
      fileFilter: imageFileFilter,
      limits:{ fileSize : maxSize },
      storage: storage
    }).single('drivingLicenceBack');

    upload(req, res, function(err) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err
        });
      }
      if (req.file) {
        User.findOne({
           where:{ id: user_id }
          })
          .then(data => {
            if (data) {
              User.update({
                  drivingLicenceBack: req.file.path
                },{
                  where: {id : user_id}
                },{
                  returning: true,
                  plain:true
                })
                .then(result => {
                  res.status(200).json({
                    status: true,
                    message: `drivingLicenceBack Uploaded`,
                  });
                });
            } else {
              res.status(404).json({
                status: false,
                message: "No User Found"
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              error: err.message
            });
          });
      } else {
        res.status(422).json({
          status: false,
          message: "No file is sent in Request"
        });
      }
    });

 },
 uploadAddressProof(req, res, next){

  var user_id = req.userId;

    var upload = multer({   
      fileFilter: imageFileFilter,
      limits:{ fileSize : maxSize },
      storage: storage
    }).single('addressProof');

    upload(req, res, function(err) {
      if (err) {
        return res.status(500).json({
          status: false,
          message: err
        });
      }
      if (req.file) {
        User.findOne({
           where:{ id: user_id }
          })
          .then(data => {
            if (data) {
              User.update({
                  addressProof: req.file.path
                },{
                  where: {id : user_id}
                },{
                  returning: true,
                  plain:true
                })
                .then(result => {
                  res.status(200).json({
                    status: true,
                    message: `addressProof Uploaded`,
                  });
                });
            } else {
              res.status(404).json({
                status: false,
                message: "No User Found"
              });
            }
          })
          .catch(err => {
            res.status(500).json({
              status: false,
              error: err.message
            });
          });
      } else {
        res.status(422).json({
          status: false,
          message: "No file is sent in Request"
        });
      }
    });

 }
}