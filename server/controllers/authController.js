const crypto = require('crypto');
const User = require('../models/User');
const { sendWelcomeEmail, sendEmail } = require('../utils/sendEmail');

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
    user.walletBalance += 50;
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

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return the same success message whether or not the email
    // exists — prevents leaking which emails are registered
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a reset link has been sent.'
      });
    }

    // Generate a random token, store only its hash (never the raw token)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const emailSent = await sendEmail({
      to: user.email,
      subject: '🔑 Reset your Astro Celestique password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #e8b460; font-size: 28px; margin: 0;">◉ Astro Celestique</h1>
          </div>
          <h2 style="color: #eee8d5;">Password Reset Requested</h2>
          <p style="color: #8899aa; line-height: 1.7;">
            Hi ${user.name}, we received a request to reset your password. Click the button below to choose a new one — this link expires in 10 minutes.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #c9963c; color: #0a0f1e; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: bold; font-size: 15px;">
              Reset Password →
            </a>
          </div>
          <p style="color: #445566; font-size: 13px;">
            If you didn't request this, you can safely ignore this email — your password won't be changed.
          </p>
        </div>
      `
    });

    if (!emailSent) {
      // Roll back the token so a broken email doesn't leave a dangling reset link
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Could not send reset email. Please try again.' });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a reset link has been sent.'
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// @desc    Reset password using the emailed token
// @route   PUT /api/auth/reset-password/:resettoken
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    }

    user.password = password; // pre-save hook hashes this automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};