import express from 'express';
import adminController from './../../controllers/admin-controller';

const router = express.Router();


// Get all users  
router.get('/admin/users',adminController.allUsers);

// update user privilege 
router.post('/admin/previledge',adminController.addPreviledge);

// et all kyc for approvals 
router.get('/admin/kyc',adminController.allKyc);

// approve Kyc 
router.put('/admin/kyc/approve',adminController.approveKyc);

// reject KYC 
router.post('/admin/kyc/reject',adminController.rejectKyc);




module.exports = router;