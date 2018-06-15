import express from 'express';
import adminController from './../../controllers/admin-controller';
import tokenController from './../../controllers/token-controller';
import btcController from './../../controllers/btc-controller';
import { adminAuthenticate } from './../../helpers/ensure-authenticated';

const router = express.Router();


// Get all users  
router.post('/users', adminAuthenticate, adminController.allUsers);

// Get all users  
router.get('/totalUsersCount', adminController.allUsersCount);

// get all users with privilege 
router.post('/privilageuser', adminAuthenticate, adminController.getUserPreviledge);

// get all kyc for approvals 
router.post('/kyc', adminAuthenticate, adminController.allKyc);

// get total purchased coins
router.post('/totalCoins', adminAuthenticate, adminController.totalCoins);

// get total remaining coins
router.post('/remainingCoins', adminAuthenticate, adminController.remainingCoins);

// approve Kyc 
router.post('/kyc/approve', adminAuthenticate, adminController.approveKyc);

// add Start date of vesting 
router.post('/addVestingDate', adminAuthenticate, adminController.addVestingDate);

// get contract  
router.post('/getContract', adminAuthenticate, adminController.getContracts);

// update contract  
router.post('/update/contract', adminAuthenticate, adminController.updateContract);

// reject KYC 
router.post('/kyc/reject', adminAuthenticate, adminController.rejectKyc);

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