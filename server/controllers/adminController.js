const User = require('../models/User');
const Puja = require('../models/Puja');
const Astrologer = require('../models/Astrologer');

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

// @desc    Create a new astrologer account (user + linked profile)
// @route   POST /api/admin/astrologers
exports.createAstrologer = async (req, res) => {
  try {
    const {
      name, email, password, displayName, bio,
      expertise, languages, experience, pricePerMin, avatar
    } = req.body;

    if (!name || !email || !password || !displayName || !experience || !pricePerMin) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, displayName, experience and pricePerMin'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name, email, password, role: 'astrologer'
    });

    const astrologer = await Astrologer.create({
      user: user._id,
      displayName,
      bio: bio || '',
      avatar: avatar || '',
      expertise: expertise || [],
      languages: languages || ['Hindi'],
      experience,
      pricePerMin,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Astrologer account created',
      astrologer: { ...astrologer.toObject(), user: { _id: user._id, name: user.name, email: user.email } }
    });
  } catch (err) {
    console.error('Create astrologer error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all astrologers (admin view, includes inactive)
// @route   GET /api/admin/astrologers
exports.getAllAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find().populate('user', 'name email isActive');
    res.status(200).json({ success: true, astrologers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update an astrologer's profile
// @route   PUT /api/admin/astrologers/:id
exports.updateAstrologer = async (req, res) => {
  try {
    const { displayName, bio, expertise, languages, experience, pricePerMin, avatar, isActive } = req.body;

    const astrologer = await Astrologer.findByIdAndUpdate(
      req.params.id,
      { displayName, bio, expertise, languages, experience, pricePerMin, avatar, isActive },
      { new: true, runValidators: true }
    );

    if (!astrologer) {
      return res.status(404).json({ success: false, message: 'Astrologer not found' });
    }

    res.status(200).json({ success: true, astrologer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Deactivate an astrologer (soft delete — keeps history intact)
// @route   DELETE /api/admin/astrologers/:id
exports.deactivateAstrologer = async (req, res) => {
  try {
    const astrologer = await Astrologer.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'offline' },
      { new: true }
    );

    if (!astrologer) {
      return res.status(404).json({ success: false, message: 'Astrologer not found' });
    }

    await User.findByIdAndUpdate(astrologer.user, { isActive: false });

    res.status(200).json({ success: true, message: 'Astrologer deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};