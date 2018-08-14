import express from 'express';
import usersController from '../controllers/users-controller';
import userRoutes from './apiv1/users-routes';

const router = express.Router();


//  Authentication to obtain a token
router.post('/forgot_password', usersController.forgotPassword);

//  Authentication to obtain a token
router.post('/reset_password', usersController.resetPassword);

// Authentication all next routes
router.use(userRoutes) ;


// API Error routes
router.use((req, res) => {
  return res.status(404).json({
  	status:false,
    message: 'No Route found'
  });
});

module.exports = router;
