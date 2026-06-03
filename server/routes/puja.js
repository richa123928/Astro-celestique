const express = require('express');
const router = express.Router();
const { bookPuja, getMyPujas } = require('../controllers/pujaController');
const { protect } = require('../middleware/auth');

router.post('/book',        protect, bookPuja);
router.get('/my-bookings',  protect, getMyPujas);

module.exports = router;