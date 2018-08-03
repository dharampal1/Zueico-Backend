import express from 'express';
import adminController from './../../controllers/admin-controller';
import tokenController from './../../controllers/token-controller';
import btcController from './../../controllers/btc-controller';
import { adminAuthenticate } from './../../helpers/ensure-authenticated';
import adminPassController from './../../controllers/admin-password-controller';

const router = express.Router();

// upload privilege Users   
router.post('/upload/privilegeUsers',adminAuthenticate, adminController.uploadPrivelgeUsers);

// Get all usd contributions  
router.post('/usd/contribution', adminAuthenticate, adminController.usdContribution);

// Get all usdt contribution
router.post('/usdt/contribution', adminAuthenticate, adminController.usdtContribution);

// Get all users  
router.post('/users', adminAuthenticate, adminController.allUsers);

// activate the refund for all users  
router.post('/refund', adminAuthenticate, btcController.refund);

// Get all users  
router.post('/totalUsersCount', adminAuthenticate, adminController.allUsersCount);

// change admin password  
router.post('/changePassword', adminAuthenticate, adminPassController.changePassword);

// get all users with privilege 
router.post('/privilageuser', adminAuthenticate, adminController.getUserPreviledge);

// get all kyc for approvals 
router.post('/kyc', adminAuthenticate, adminController.allKyc);

// get all trancations for user buyt token 
router.post('/transactions', adminAuthenticate, adminController.allTrancations);

// // get total purchased coins
// router.post('/totalCoins', adminAuthenticate, adminController.totalCoins);

// get btc  wallet address 
router.post('/btcWalletAddress', adminAuthenticate, btcController.getBtcWallet);

// add/update btc  wallet address 
router.post('/add/btcWalletAddress', adminAuthenticate, btcController.updateBtcWallet);

// get all btc  contributions 
router.post('/btc/contribution', adminAuthenticate, btcController.btcContribution);

// // get total remaining coins
// router.post('/remainingCoins', adminAuthenticate, adminController.remainingCoins);

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
router.post('/publicStripeKey', adminAuthenticate, adminController.publicStripeKey);

// getPublicStripeKey 
router.post('/getPublicStripeKey', adminAuthenticate, tokenController.getPublicStripeKey);

// add stripe API key  
router.post('/stripeKey', adminAuthenticate, adminController.stripeKey);

// get getTokenDetails
router.post('/getTokenDetails', adminAuthenticate, tokenController.getTokenDetails);

// get getICOstats
router.post('/getICOstats', adminAuthenticate, tokenController.getICOstats);

// get getICOdetails 
router.post('/getICOdetails', adminAuthenticate, tokenController.getICOdetails);






module.exports = router;
