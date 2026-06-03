const express = require('express');
const router = express.Router();
const { getDailyPanchang } = require('../controllers/panchangController');

router.post('/daily', getDailyPanchang);

module.exports = router;