const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { getAstrologers, getMyProfile, getStatus } = require('../controllers/astrologerController');
const { protect } = require('../middleware/auth');

router.get('/', getAstrologers);
router.get('/me', protect, getMyProfile);
router.get('/status', getStatus);

module.exports = router;