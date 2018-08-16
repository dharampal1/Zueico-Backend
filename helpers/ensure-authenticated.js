import jwt from 'jsonwebtoken';
import { User, Admin } from '../models';
import config from '../config/environment';
import Sequelize from 'sequelize';

const Op = Sequelize.Op;

module.exports = {

    /*
       // Any route past this point requires a valid auth token
     */
  authenticate: function(req, res, next) {

  const token = req.headers.authorization ;

    if (token) {
        jwt.verify(token, config.SECRET, (err, decoded) => {
          if (err) {
            return res.status(500).json({
                status:false,
                message: err.message
              });
          }
          User.findOne({  where: { [Op.and]: [{ email:decoded.email }, { id : decoded.id }] } })
            .then(user => {           
              if (user) {
                 req.userId = decoded.id;
                  next()    
                 return null;
               } else {
                return res.status(401).json({
                  status:false,
                  message: 'Authentication Failed'
                });
              }
            })
            .catch(err => {
              return res.status(500).json({
                status:false,
                message: err
              });

            });

        });
      } else {
         return res.status(401).json({
          status:false,
          message: 'Failed authentication: No Token Provided.'
        });
      }
  },
  /*
       // Any route past this point requires a valid auth token
     */
  adminAuthenticate: function(req, res, next) {

  const token = req.headers.authorization ;

    if (token) {
        jwt.verify(token, config.SECRET, (err, decoded) => {
          if (err) {
            return res.status(500).json({
                status:false,
                message: err.message
              });
          }
          Admin.findOne({ where: { [Op.and]: [{ email:decoded.email }, { id : decoded.id }] } })
            .then(admin => {           
              if (admin) {
                 req.id = decoded.id;
                  next()    
                 return null;
               } else {
                return res.status(401).json({
                  status:false,
                  message: 'Authentication Failed'
                });
              }
            })
            .catch(err => {
              return res.status(500).json({
                status:false,
                message: err
              });

            });

        });
      } else {
         return res.status(401).json({
          status:false,
          message: 'failed authentication: No Token Provided.'
        });
      }
  }
}