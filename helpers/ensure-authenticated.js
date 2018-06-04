import jwt from 'jsonwebtoken';
import { Users } from '../models';
import config from '../config/environment';

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
                message: err
              });
          }
          Users.findOne({ where: { id: decoded.id } })
            .then(user => {           
              if (user) {
                 req.userId = decoded.id;
                  next()    
                 return null;
               } else {
                return res.status(401).json({
                  message: 'Authentication Failed'
                });
              }
            })
            .catch(err => {
              return res.status(500).json({
                message: err
              });

            });

        });
      } else {
         return res.status(401).json({
          message: 'failed authentication: No Token Provided.'
        });
      }
  }
}