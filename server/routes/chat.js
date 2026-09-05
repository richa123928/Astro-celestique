const express = require('express');
const router = express.Router();
const {
  sendAIMessage,
  getChatHistory,
  sendSupportMessage,
  escalateToHuman
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/ai',                protect, sendAIMessage);
router.get('/ai/:sessionId',      protect, getChatHistory);
router.post('/support',           sendSupportMessage);
router.post('/support/escalate',  escalateToHuman);

module.exports = router;