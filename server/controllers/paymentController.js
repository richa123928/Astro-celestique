const Razorpay = require('razorpay');
const crypto   = require('crypto');
const User     = require('../models/User');
const Puja     = require('../models/Puja');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', purpose, pujaId } = req.body;

    const options = {
      amount:   Math.round(amount * 100), // Razorpay needs paise
      currency: 'INR', // Always INR for Razorpay
      receipt:  `receipt_${Date.now()}`,
      notes: {
        userId:  req.user._id.toString(),
        purpose: purpose || 'Astro Celestique Payment',
        pujaId:  pujaId || '',
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Payment order error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      purpose,
      pujaId,
      amount
    } = req.body;

    // Verify signature
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Payment verified — update based on purpose
    if (purpose === 'wallet') {
      // Add to wallet
      const user = await User.findById(req.user._id);
      user.walletBalance += amount;
      await user.save();

      return res.status(200).json({
        success: true,
        message: `₹${amount} added to wallet successfully!`,
        walletBalance: user.walletBalance
      });
    }

    if (purpose === 'puja' && pujaId) {
      // Update puja payment status
      await Puja.findByIdAndUpdate(pujaId, {
        paymentStatus:  'paid',
        paymentId:      razorpay_payment_id,
        paymentGateway: 'razorpay',
        status:         'confirmed'
      });

      return res.status(200).json({
        success: true,
        message: 'Puja payment confirmed!',
      });
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully!' });

  } catch (err) {
    console.error('Payment verify error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
exports.getPaymentHistory = async (req, res) => {
  try {
    const pujas = await Puja.find({
      user: req.user._id,
      paymentStatus: 'paid'
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments: pujas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};