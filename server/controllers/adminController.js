const User = require('../models/User');
const Puja = require('../models/Puja');

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Puja.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Puja.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers    = await User.countDocuments();
    const totalBookings = await Puja.countDocuments();
    const pendingBookings = await Puja.countDocuments({ status: 'pending' });
    const completedBookings = await Puja.countDocuments({ status: 'completed' });

    const revenueData = await Puja.aggregate([
      { $group: { _id: null, total: { $sum: '$amountINR' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};