const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  getMe,
  updateCurrency,
  forgotPassword,
  resetPassword,
  getWalletHistory
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Brute-force protection: 5 login attempts per 15 min per IP.
// Deliberately strict — a real user mistyping their password a few times
// is not the scenario this guards against.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' }
});

// Prevents scripted mass-account creation from a single IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many accounts created from this network. Please try again later.' }
});

// Prevents email-flooding a target inbox with reset links
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many reset requests. Please check your inbox or try again later.' }
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.get('/wallet-history', protect, getWalletHistory);
router.put('/currency', protect, updateCurrency);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

module.exports = router;