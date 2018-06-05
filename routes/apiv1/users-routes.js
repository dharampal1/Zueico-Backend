import express from 'express';
import usersController from './../../controllers/users-controller';

const router = express.Router();


// get user profile 
router.post('/me',usersController.getSingleUser);

// update user profile 
router.post('/',usersController.updateUser);

// update user password 
router.post('/password',usersController.changePassword);

// upload user passport  
router.post('/upload/passport',usersController.uploadImage);

// upload user Driving License
router.post('/upload/drivingLicenceFront',usersController.uploadImage);

// upload user Driving License
router.post('/upload/drivingLicenceBack',usersController.uploadImage);

// upload user address Proof 
router.post('/upload/addressProof',usersController.uploadImage);



module.exports = router;