const Puja = require('../models/Puja');
const User = require('../models/User');
const { sendPujaBookingNotification } = require('../utils/sendEmail');

// @desc    Book a puja
// @route   POST /api/puja/book
exports.bookPuja = async (req, res) => {
  try {
    const {
      pujaType, primaryPerson, secondaryPerson,
      deceasedDetails, preferredDate, specialNotes, amountINR
    } = req.body;

    const puja = await Puja.create({
      user:           req.user._id,
      pujaType,
      primaryPerson,
      secondaryPerson,
      deceasedDetails,
      preferredDate,
      specialNotes,
      amountINR,
      currency:       req.user.currency || 'INR',
      status:         'pending',
      paymentStatus:  'pending'
    });

    // Send emails
    // Respond immediately — don't make the user wait on the email round-trip
    res.status(201).json({
      success: true,
      message: 'Puja booked successfully! Our team will contact you within 24 hours.',
      puja
    });

    // Send the confirmation email in the background, after responding.
    // A slow/failed email should never delay or block a successful booking.
    User.findById(req.user._id)
      .then(user => sendPujaBookingNotification(puja, user))
      .catch(err => console.error('Puja notification email error:', err.message));
  } catch (err) {
    console.error('Puja booking error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get my puja bookings
// @route   GET /api/puja/my-bookings
exports.getMyPujas = async (req, res) => {
  try {
    const pujas = await Puja.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pujas.length,
      pujas
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};