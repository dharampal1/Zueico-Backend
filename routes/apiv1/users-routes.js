import express from 'express';
import usersController from './../../controllers/users-controller';
import kycController from './../../controllers/kyc-controller';
import adminController from './../../controllers/admin-controller';
import tokenController from './../../controllers/token-controller';
import { authenticate } from './../../helpers/ensure-authenticated';
import btcController from './../../controllers/btc-controller';

const router = express.Router();

// get admin btc  wallet address 
router.post('/btcWalletAddress', authenticate, btcController.getBtcWallet);

// get user profile 
router.post('/getPricePerToken',authenticate ,btcController.getPricePerToken);

// get user profile 
router.post('/me', authenticate, usersController.getSingleUser);

// get user KycStatus 
router.post('/getKycStatus', authenticate, usersController.getKycStatus);

// get user WalletAddress
router.post('/getWalletAddress', authenticate, usersController.getWalletAddress);

// get user WalletAddress
router.post('/chargeCard', authenticate, usersController.chargeCard);

// update user profile 
router.post('/', authenticate, usersController.updateUser);

// update user password 
router.post('/password', authenticate, usersController.changePassword);

// upload user passport  
router.post('/upload/passport', authenticate, kycController.uploadPassport);

// upload user Driving License
router.post('/upload/drivingLicenceFront', authenticate, kycController.uploadDrivingFront);

// upload user Driving License
router.post('/upload/drivingLicenceBack', authenticate, kycController.uploadDrivingBack);

// upload user address Proof 
router.post('/upload/addressProof', authenticate, kycController.uploadAddressProof);

// get stats for eth , usd and btc raised
router.post('/contribuationStatistics', authenticate, btcController.contribuationStatistics);

// get current price for btc and usd and eth 
router.post('/getCurrentPrice', authenticate, btcController.getCurrentPrice);

// // set current price for btc and usd
// router.post('/setCurrentPrice', authenticate, btcController.setCurrentPrice);

// get contract  
router.post('/getContract', authenticate, adminController.getContracts);

// total buy token
router.post('/totalRemainingToken', authenticate, tokenController.totalRemainingToken);

// total buy token
router.post('/totalPurchasedToken', authenticate, tokenController.totalUserbuytoken);

// total tansfer token
router.post('/getTransferdTokens', authenticate, tokenController.getTransferdTokens);

// get stripe API key  
router.post('/getstripeKey', authenticate, adminController.getstripeKey);

// total orders
router.post('/totalOrders', authenticate, tokenController.totalOrders);

// total orders
router.post('/orders/BTC', authenticate, tokenController.totalBTCOrders);

// total orders
router.post('/orders/ETH', authenticate, tokenController.totalETHOrders);

// total orders
router.post('/orders/USD', authenticate, tokenController.totalUSDOrders);

// // place order BTC
// router.post('/buyToken', authenticate, tokenController.buyToken);

// 
router.post('/tokenTransfer', authenticate, tokenController.tokenTranfer);

//  tokenTranfer
router.post('/getTokenDetails', authenticate, tokenController.getTokenDetails);

// get getICOstats
router.post('/getICOstats', authenticate, tokenController.getICOstats);

// get getICOdetails 
router.post('/getICOdetails', authenticate, tokenController.getICOdetails);

// getPrivateKey 
router.post('/getPrivateKey', authenticate, tokenController.getPrivateKey);

// getPublicStripeKey 
router.post('/getPublicStripeKey', authenticate, tokenController.getPublicStripeKey);

// getBalance 
router.post('/getBalance', authenticate, tokenController.getBalance);

// sendETH 
router.post('/sendETH', authenticate, tokenController.sendETH);


// checkApproval 
router.post('/checkApproval', authenticate, tokenController.checkApproval);


module.exports = router;