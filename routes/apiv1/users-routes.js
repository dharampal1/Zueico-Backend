import express from 'express';
import usersController from './../../controllers/users-controller';
import kycController from './../../controllers/kyc-controller';
import tokenController from './../../controllers/token-controller';
import { authenticate } from './../../helpers/ensure-authenticated';


const router = express.Router();


// get user profile 
router.post('/me', authenticate, usersController.getSingleUser);

// get user KycStatus 
router.post('/getKycStatus', authenticate, usersController.getKycStatus);

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



// total buy token
router.post('/totalRemainingToken', authenticate, tokenController.totalRemainingToken);

// total buy token
router.post('/totalUserbuytoken', authenticate, tokenController.totalUserbuytoken);

// total orders
router.post('/totalOrders', authenticate, tokenController.totalOrders);

// buyToken
router.post('/buyToken', authenticate, tokenController.buyToken);

// 
router.post('/tokenTranfer', authenticate, tokenController.tokenTranfer);

//  tokenTranfer
router.post('/getTokenDetails', authenticate, tokenController.getTokenDetails);

// get getICOstats
router.post('/getICOstats', authenticate, tokenController.getICOstats);

// get getICOdetails 
router.post('/getICOdetails', authenticate, tokenController.getICOdetails);

// getPrivateKey 
router.post('/getPrivateKey', authenticate, tokenController.getPrivateKey);

// getBalance 
router.post('/getBalance', authenticate, tokenController.getBalance);

// sendETH 
router.post('/sendETH', authenticate, tokenController.sendETH);


// checkApproval 
router.post('/checkApproval', authenticate, tokenController.checkApproval);

// approveAddress 
router.post('/approveAddress', authenticate, tokenController.approveAddress);


module.exports = router;