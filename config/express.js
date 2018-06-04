// Dependencies
import Promise  from 'promise';
import config  from './environment';
import routes  from '../routes/routes';
import express  from 'express';
import bodyParser  from 'body-parser';
import logger  from 'morgan';
import path   from 'path';


const initApp = function () {
  // Init
  const app = express();

  // serving static files to the client    
   app.use('/public/uploads', express.static(path.join(__dirname + '/public/uploads')));


  // Config
  app.set('port', config.PORT);

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());
  app.use(logger('dev'));

  
  // Setup routes
  routes(app);

  return app;
};

module.exports = initApp;
