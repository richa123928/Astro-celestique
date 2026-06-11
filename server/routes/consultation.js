const express = require('express');
const router  = express.Router();
const {
  startSession,
  sendMessage,
  getSession,
  endSession,
  deductWallet
} = require('../controllers/consultationController');
const { protect } = require('../middleware/auth');

router.post('/start',             protect, startSession);
router.post('/message',           protect, sendMessage);
router.get('/session/:sessionId', protect, getSession);
router.post('/end',               protect, endSession);
router.post('/deduct',            protect, deductWallet);

module.exports = router;