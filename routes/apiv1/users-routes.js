import express from 'express';
import usersController from './../../controllers/users.controller';

const router = express.Router();


// get user profile 
router.get('/users/me',usersController.getSingleUser);

// update user profile 
router.put('/users',usersController.updateUser);

// update user password 
router.put('/users/password',usersController.changePassword);

// upload user passport  
router.put('/users/upload/passport',usersController.uploadImage);

// upload user Driving License
router.put('/users/upload/drivingLicenceFront',usersController.uploadImage);

// upload user Driving License
router.put('/users/upload/drivingLicenceBack',usersController.uploadImage);

// upload user address Proof 
router.put('/users/upload/addressProof',usersController.uploadImage);



module.exports = router;