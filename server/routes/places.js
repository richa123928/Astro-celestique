const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { searchPlaces } = require('../controllers/placesController');

const searchLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many searches, please slow down.' }
});

router.get('/search', searchLimiter, searchPlaces);

module.exports = router;