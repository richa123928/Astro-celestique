const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  getStats,
  createAstrologer,
  getAllAstrologers,
  updateAstrologer,
  deactivateAstrologer
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/bookings',          protect, authorize('admin'), getAllBookings);
router.put('/bookings/:id',      protect, authorize('admin'), updateBookingStatus);
router.get('/users',             protect, authorize('admin'), getAllUsers);
router.get('/stats',             protect, authorize('admin'), getStats);

router.post('/astrologers',      protect, authorize('admin'), createAstrologer);
router.get('/astrologers',       protect, authorize('admin'), getAllAstrologers);
router.put('/astrologers/:id',   protect, authorize('admin'), updateAstrologer);
router.delete('/astrologers/:id', protect, authorize('admin'), deactivateAstrologer);

module.exports = router;