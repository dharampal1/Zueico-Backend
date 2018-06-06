import express from 'express';
import adminController from '../controllers/admin-controller';
import adminRoutes from './apiv1/admin-routes';

const router = express.Router();

//  Authentication to obtain a token
router.post('/login', adminController.adminLogin);

router.use(adminRoutes);

// API Error routes
router.use((req, res) => {
  return res.status(404).json({
    message: 'No Route found.'
  });
});

module.exports = router;
