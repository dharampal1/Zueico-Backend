// Dependencies
import Promise  from 'promise';
import config  from './environment';
import routes  from '../routes/routes';
import express  from 'express';
import bodyParser  from 'body-parser';
import logger  from 'morgan';
import path   from 'path';
import cors from 'cors';
import {
  BTC_Tranctions,
  vestingAddrressStatus,
  USD_Tranctions,
  checkTxHashWallet,
  checkTxHashBuy,
  checkTxHashTrans,
  cronForTransfer,
  refundTxHash,
  setCurrentPrice,
  vestingHashStatus,
  endTimeHashStatus,
  updateTotalPurchase,
  updateApproveAddress,
  relHashHashStatus,
  ReleasedAirDropTokens,
  checkTxHashReferralBonus,
  checkTxHashBonus,
  releaseBonusTokens
} from '../helpers/cron-job';

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
  
    cronForTransfer(); 
    refundTxHash();
    setCurrentPrice();
    vestingHashStatus();
    vestingAddrressStatus();
    updateTotalPurchase();
    updateApproveAddress();
    relHashHashStatus();
    BTC_Tranctions();
    USD_Tranctions();
    checkTxHashWallet();
    checkTxHashBuy();
    checkTxHashTrans();
    ReleasedAirDropTokens();
    checkTxHashReferralBonus();
    checkTxHashBonus();
    releaseBonusTokens();
  
  // Setup routes
  routes(app);
   

  return app;
};

module.exports = initApp;
