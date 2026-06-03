const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/bookings',          protect, authorize('admin'), getAllBookings);
router.put('/bookings/:id',      protect, authorize('admin'), updateBookingStatus);
router.get('/users',             protect, authorize('admin'), getAllUsers);
router.get('/stats',             protect, authorize('admin'), getStats);

module.exports = router;