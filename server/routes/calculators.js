const express = require('express');
const router = express.Router();
const { runCalculator } = require('../controllers/calculatorController');

router.post('/:type', runCalculator);

module.exports = router;