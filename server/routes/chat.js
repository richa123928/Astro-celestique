const express = require('express');
const router = express.Router();
const {
  sendAIMessage,
  getChatHistory,
  addFunds
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/ai',             protect, sendAIMessage);
router.get('/ai/:sessionId',   protect, getChatHistory);
router.post('/add-funds',      protect, addFunds);

module.exports = router;