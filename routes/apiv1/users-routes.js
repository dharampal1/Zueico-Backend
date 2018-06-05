import express from 'express';
import usersController from './../../controllers/users-controller';

const router = express.Router();


// get user profile 
router.get('/users/me',usersController.getSingleUser);

// update user profile 
router.post('/users',usersController.updateUser);

// update user password 
router.post('/users/password',usersController.changePassword);

// upload user passport  
router.post('/users/upload/passport',usersController.uploadImage);

// upload user Driving License
router.post('/users/upload/drivingLicenceFront',usersController.uploadImage);

// upload user Driving License
router.post('/users/upload/drivingLicenceBack',usersController.uploadImage);

// upload user address Proof 
router.post('/users/upload/addressProof',usersController.uploadImage);



module.exports = router;