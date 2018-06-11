// Dependencies
import Promise  from 'promise';
import config  from './environment';
import routes  from '../routes/routes';
import express  from 'express';
import bodyParser  from 'body-parser';
import logger  from 'morgan';
import path   from 'path';
import cors from 'cors';
import request from 'request'

const initApp = function () {
  // Init
  const app = express();

  app.use(cors());

  // Config
  app.set('port', config.PORT);

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use(bodyParser.json());
  app.use(logger('dev'));
   
  // serving static files to the client    
  app.use('/public/uploads', express.static('public/uploads'));
      
  
  // Setup routes
  routes(app);
   

  return app;
};

module.exports = initApp;
