const User = require('../models/User');
const { sendWelcomeEmail } = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = new User({ name, email, password, walletBalance: 50 });
    await user.save();

    const token = user.getSignedJwtToken();
    // Send welcome email
    sendWelcomeEmail(user).catch(err => console.log('Welcome email error:', err.message));

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        currency: user.currency
      }
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        currency: user.currency
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update currency preference
// @route   PUT /api/auth/currency
exports.updateCurrency = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { currency: req.body.currency },
      { new: true }
    );
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update wallet balance
// @route   PUT /api/auth/wallet
exports.updateWallet = async (req, res) => {
  try {
    const { amount, type } = req.body;
    const user = await User.findById(req.user.id);

    if (type === 'add') {
      user.walletBalance += amount;
    } else if (type === 'deduct') {
      if (user.walletBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance'
        });
      }
      user.walletBalance -= amount;
    }

    await user.save();

    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};