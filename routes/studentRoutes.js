const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated, isRole } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Shield all student paths with authentication and role filters
router.use(isAuthenticated, isRole(['student']));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.post('/profile/update', (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      req.flash('error_msg', err.message);
      return res.redirect('/student/profile');
    }
    next();
  });
}, studentController.postUpdateProfile);
router.get('/attendance', studentController.getAttendance);
router.get('/results', studentController.getResults);
router.get('/id-card', studentController.getIdCard);
router.get('/admit-card', studentController.getAdmitCard);
router.get('/homework', studentController.getHomework);

// Fees & Payments
router.get('/fee-payment', studentController.getFeePayment);
router.get('/checkout/:invoiceId', studentController.getSimulatedCheckout);
router.post('/checkout', studentController.postSimulatedCheckout);
router.get('/receipt/:invoiceId', studentController.getFeeReceipt);

// Notice alerts
router.get('/notifications', studentController.getNotifications);

module.exports = router;
