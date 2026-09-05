const Astrologer = require('../models/Astrologer');
const Earning = require('../models/Earning');
const astrologerStatusStore = require('../utils/astrologerStatusStore');

// @desc    Get all active astrologers, with live online/busy status merged in
// @route   GET /api/astrologers
exports.getAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find({ isActive: true })
      .populate('user', 'name');

    const { onlineAstrologers, busyAstrologers } = astrologerStatusStore.getStatusSnapshot();

    const result = astrologers.map(a => {
      const id = a._id.toString();
      const liveStatus = busyAstrologers.includes(id) ? 'busy'
        : onlineAstrologers.includes(id) ? 'online'
        : 'offline';

      return {
        id,
        name: a.displayName,
        avatar: a.avatar,
        bio: a.bio,
        expertise: a.expertise,
        languages: a.languages,
        experience: a.experience,
        rate: a.pricePerMin,
        rating: a.rating,
        totalSessions: a.totalSessions,
        verified: a.isVerified,
        status: liveStatus
      };
    });

    res.status(200).json({ success: true, astrologers: result });
  } catch (err) {
    console.error('Get astrologers error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get the logged-in astrologer's own profile (for the dashboard —
//          this replaces the old hardcoded email-to-ID mapping)
// @route   GET /api/astrologers/me
exports.getMyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ success: false, message: 'Not registered as an astrologer' });
    }

    const astrologer = await Astrologer.findOne({ user: req.user.id });
    if (!astrologer) {
      return res.status(404).json({ success: false, message: 'No astrologer profile found for this account' });
    }

    res.status(200).json({ success: true, astrologer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Real-time online/busy astrologer IDs
// @route   GET /api/astrologers/status
exports.getStatus = (req, res) => {
  const { onlineAstrologers, busyAstrologers } = astrologerStatusStore.getStatusSnapshot();
  res.json({ success: true, onlineAstrologers, busyAstrologers });
};

// @desc    Real today's stats (sessions, minutes, earnings) — from the DB,
//          not local component state that resets on refresh
// @route   GET /api/astrologers/me/today-stats
exports.getTodayStats = async (req, res) => {
  try {
    if (req.user.role !== 'astrologer') {
      return res.status(403).json({ success: false, message: 'Not registered as an astrologer' });
    }

    const astrologer = await Astrologer.findOne({ user: req.user.id });
    if (!astrologer) {
      return res.status(404).json({ success: false, message: 'No astrologer profile found for this account' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysEarnings = await Earning.find({
      astrologer: astrologer._id,
      createdAt:  { $gte: startOfToday }
    });

    const totalMinutes  = todaysEarnings.reduce((sum, e) => sum + e.minutesBilled, 0);
    const totalEarnings = todaysEarnings.reduce((sum, e) => sum + e.amount, 0);
    const todaySessions = new Set(todaysEarnings.map(e => e.sessionId)).size;

    res.status(200).json({
      success: true,
      todaySessions,
      totalMinutes,
      todaysEarnings: totalEarnings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};