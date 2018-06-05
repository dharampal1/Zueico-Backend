import express from 'express';
import adminController from './../../controllers/admin-controller';

const router = express.Router();


// Get all users  
router.post('/users',adminController.allUsers);

// get all users with privilege 
router.post('/previledge',adminController.getUserPreviledge);

// get all kyc for approvals 
router.post('/kyc',adminController.allKyc);

// approve Kyc 
router.post('/kyc/approve',adminController.approveKyc);

// reject KYC 
router.post('/kyc/reject',adminController.rejectKyc);




module.exports = router;