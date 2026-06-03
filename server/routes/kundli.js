const express = require('express');
const router = express.Router();
const { generateKundli } = require('../controllers/kundliController');

router.post('/generate', generateKundli);

module.exports = router;