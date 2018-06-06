import express from 'express';
import multer from 'multer';
import usersController from './../../controllers/users-controller';
import { authenticate } from './../../helpers/ensure-authenticated';
import { storage, imageFileFilter } from './../../helpers/fileUpload';

var upload = multer({   
      fileFilter: imageFileFilter,
      storage: storage
    });

const router = express.Router();


// get user profile 
router.post('/me', authenticate, usersController.getSingleUser);

// update user profile 
router.post('/', authenticate, usersController.updateUser);

// update user password 
router.post('/password', authenticate, usersController.changePassword);

// upload user passport  
router.post('/upload/passport', authenticate, upload.single('passport'), usersController.uploadImage);

// upload user Driving License
router.post('/upload/drivingLicenceFront', authenticate, upload.single('drivingLicenceFront'), usersController.uploadImage);

// upload user Driving License
router.post('/upload/drivingLicenceBack', authenticate,upload.single('drivingLicenceBack'), usersController.uploadImage);

// upload user address Proof 
router.post('/upload/addressProof', authenticate,upload.single('addressProof'), usersController.uploadImage);



module.exports = router;