const Order = require('../models/Order');

// @desc    Create a pending remedies order (called BEFORE Razorpay checkout opens)
// @route   POST /api/remedies/order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const amount = items.reduce(
      (total, item) => total + (item.price * (item.qty || 1)),
      0
    );

    const order = await Order.create({
      user:            req.user._id,
      items,
      shippingAddress,
      amount,
      currency:        req.user.currency || 'INR',
      status:          'pending',
      paymentStatus:   'pending'
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Create remedies order error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get my remedies orders
// @route   GET /api/remedies/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};