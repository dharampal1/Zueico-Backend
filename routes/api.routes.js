import express from 'express';
import { authenticate } from '../helpers/ensure-authenticated';
import usersController from '../controllers/users.controller';
import userRoutes from './apiv1/users-routes';

const router = express.Router();

// Registration of new users via API
router.post('/auth/register', usersController.createUser);

//  Authentication to obtain a token
router.post('/auth/login', usersController.authenticate);

//  Authentication to obtain a token
router.post('/users/forgot_password', usersController.forgotPassword);

//  Authentication to obtain a token
router.post('/users/reset_password', usersController.resetPassword);

// Authentication all next routes
router.use(authenticate, userRoutes) ;


// API Error routes
router.use((req, res) => {
  return res.status(404).json({
    message: 'No Route found.'
  });
});

module.exports = router;
