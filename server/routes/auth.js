const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateCurrency,
  updateWallet,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/currency', protect, updateCurrency);
router.put('/wallet', protect, updateWallet);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;