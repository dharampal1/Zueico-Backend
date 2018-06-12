import express from 'express';
import adminController from './../../controllers/admin-controller';
import tokenController from './../../controllers/token-controller';
import btcController from './../../controllers/btc-controller';
import { adminAuthenticate } from './../../helpers/ensure-authenticated';

const router = express.Router();


// Get all users  
router.post('/users', adminAuthenticate, adminController.allUsers);

// Get all users  
router.post('/totalUsersCount', adminAuthenticate, adminController.allUsersCount);

// get all users with privilege 
router.post('/privilageuser', adminAuthenticate, adminController.getUserPreviledge);

// get all kyc for approvals 
router.post('/kyc', adminAuthenticate, adminController.allKyc);

// approve Kyc 
router.post('/kyc/approve', adminAuthenticate, adminController.approveKyc);

// reject KYC 
router.post('/kyc/reject', adminAuthenticate, adminController.rejectKyc);

// get BTC contribution 
router.post('/contribution/BTC', adminAuthenticate, adminController.btcContribution);

// get ETH contribution 
router.post('/contribution/ETH', adminAuthenticate, adminController.ethContribution);

// get ETH contribution 
router.post('/vesting', adminAuthenticate, btcController.vestingInit);


// get stripe API key  
router.post('/getstripeKey', adminAuthenticate, adminController.getstripeKey);

// add stripe API key  
router.post('/stripeKey', adminAuthenticate, adminController.stripeKey);

// get getTokenDetails
router.post('/getTokenDetails', adminAuthenticate, tokenController.getTokenDetails);

// get getICOstats
router.post('/getICOstats', adminAuthenticate, tokenController.getICOstats);

// get getICOdetails 
router.post('/getICOdetails', adminAuthenticate, tokenController.getICOdetails);






module.exports = router;