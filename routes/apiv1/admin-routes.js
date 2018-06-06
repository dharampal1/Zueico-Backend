import express from 'express';
import adminController from './../../controllers/admin-controller';
import { adminAuthenticate } from './../../helpers/ensure-authenticated';

const router = express.Router();


// Get all users  
router.post('/users', adminAuthenticate, adminController.allUsers);

// get all users with privilege 
router.post('/previledge', adminAuthenticate, adminController.getUserPreviledge);

// get all kyc for approvals 
router.post('/kyc', adminAuthenticate, adminController.allKyc);

// approve Kyc 
router.post('/kyc/approve', adminAuthenticate, adminController.approveKyc);

// reject KYC 
router.post('/kyc/reject', adminAuthenticate, adminController.rejectKyc);




module.exports = router;