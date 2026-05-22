const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateCurrency,
  updateWallet
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/currency', protect, updateCurrency);
router.put('/wallet', protect, updateWallet);

module.exports = router;