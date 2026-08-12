const express = require('express');
const router = express.Router();
const astrologerStatusStore = require('../utils/astrologerStatusStore');

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Astrologers route working' });
});

// @desc    Real-time online/busy astrologer IDs (polled by the frontend
//          every few seconds to show live status badges)
// @route   GET /api/astrologers/status
router.get('/status', (req, res) => {
  const { onlineAstrologers, busyAstrologers } = astrologerStatusStore.getStatusSnapshot();
  res.json({ success: true, onlineAstrologers, busyAstrologers });
});

module.exports = router;