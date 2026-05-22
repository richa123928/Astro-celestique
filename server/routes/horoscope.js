const express = require('express');
const router = express.Router();
const {
  getHoroscope,
  getAllHoroscopes
} = require('../controllers/horoscopeController');

router.get('/all/:type',  getAllHoroscopes);
router.get('/:type/:sign', getHoroscope);

module.exports = router;