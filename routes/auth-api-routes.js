import express from 'express';
import usersController from '../controllers/users-controller';


const router = express.Router();

// Registration of new users via API
router.post('/register', usersController.createUser);

//  Authentication to obtain a token
router.post('/login', usersController.authenticate);


// API Error routes
router.use((req, res) => {
  return res.status(404).json({
    message: 'No Route found.'
  });
});

module.exports = router;
