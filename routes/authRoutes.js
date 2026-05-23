const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/authMiddleware');

router.get('/login', redirectIfLoggedIn, authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', redirectIfLoggedIn, authController.getRegister);
router.post('/register', authController.postRegister);

router.get('/verify-otp', authController.getVerifyOtp);
router.post('/verify-otp', authController.postVerifyOtp);

router.get('/forgot-password', redirectIfLoggedIn, authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

router.get('/logout', authController.getLogout);

module.exports = router;
