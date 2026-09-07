const Groq       = require('groq-sdk');
const { translateMessage, detectLanguage } = require('../utils/translate');
const User       = require('../models/User');
const Astrologer = require('../models/Astrologer');
const Earning    = require('../models/Earning');
const WalletTransaction = require('../models/WalletTransaction');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store active sessions in memory
const activeSessions = require('../utils/activeSessions');

// @desc    Start consultation session
// @route   POST /api/consultation/start
exports.startSession = async (req, res) => {
  try {
    const { astrologerId, astrologerName, mode } = req.body;
    const userId = req.user._id.toString();

    const sessionId = `session_${userId}_${Date.now()}`;

    activeSessions[sessionId] = {
      userId,
      astrologerId,
      astrologerName,
      mode,
      startTime: new Date(),
      messages: [],
      isActive: true
    };

    // Count this as one session for the astrologer (lifetime total)
    Astrologer.findByIdAndUpdate(astrologerId, { $inc: { totalSessions: 1 } }).catch(() => {});

    res.status(200).json({
      success: true,
      sessionId,
      message: `Session started with ${astrologerName}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Send message in consultation (with translation)
// @route   POST /api/consultation/message
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, senderType } = req.body;
    // senderType: 'user' or 'astrologer'

    const detectedLang = detectLanguage(message);
    let translatedMessage = message;

    // User sends English → translate to Hindi for astrologer
    if (senderType === 'user' && detectedLang === 'english') {
      translatedMessage = await translateMessage(message, 'hindi');
    }

    // Astrologer sends Hindi → translate to English for user
    if (senderType === 'astrologer' && detectedLang === 'hindi') {
      translatedMessage = await translateMessage(message, 'english');
    }

    // Also handle if user writes in Hindi (translate to English for display)
    if (senderType === 'user' && detectedLang === 'hindi') {
      translatedMessage = await translateMessage(message, 'english');
    }

    // Store message
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].messages.push({
        senderType,
        originalMessage: message,
        translatedMessage,
        detectedLang,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      originalMessage: message,
      translatedMessage,
      detectedLang,
      senderType
    });

  } catch (err) {
    console.error('Consultation message error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get session messages
// @route   GET /api/consultation/session/:sessionId
exports.getSession = async (req, res) => {
  try {
    const session = activeSessions[req.params.sessionId];
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    End session
// @route   POST /api/consultation/end
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].isActive = false;
      activeSessions[sessionId].endTime = new Date();
    }
    res.status(200).json({ success: true, message: 'Session ended' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Deduct wallet per minute AND credit the astrologer's earnings
// @route   POST /api/consultation/deduct
exports.deductWallet = async (req, res) => {
  try {
    const { sessionId, amount, astrologerName } = req.body;
    const user = await User.findById(req.user._id);

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        walletBalance: user.walletBalance
      });
    }

    const session = activeSessions[sessionId];
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found — cannot credit astrologer'
      });
    }

    // 1. Debit the user
    user.walletBalance -= amount;
    await user.save();

    WalletTransaction.create({
      user: req.user._id,
      type: session.mode === 'call' ? 'call_debit' : 'consultation_debit',
      amount: -amount,
      description: `${session.mode === 'call' ? 'Call' : 'Chat'} with ${astrologerName || 'astrologer'}`,
      balanceAfter: user.walletBalance
    }).catch(err => console.error('Failed to log wallet transaction:', err.message));

    // 2. Credit the astrologer — create an earning record + bump running totals
    await Earning.create({
      astrologer: session.astrologerId,
      user:       req.user._id,
      sessionId,
      type:       session.mode === 'call' ? 'call' : 'chat',
      amount,
      minutesBilled: 1
    });

    await Astrologer.findByIdAndUpdate(session.astrologerId, {
      $inc: { totalEarnings: amount }
    });

    res.status(200).json({
      success:       true,
      walletBalance: user.walletBalance,
      deducted:      amount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};