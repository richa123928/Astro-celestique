const Groq = require('groq-sdk');
const { translateMessage, detectLanguage } = require('../utils/translate');
const User = require('../models/User');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store active sessions in memory
const activeSessions = {};

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

// @desc    Deduct wallet per minute
// @route   POST /api/consultation/deduct
exports.deductWallet = async (req, res) => {
  try {
    const { amount, astrologerName } = req.body;
    const user = await User.findById(req.user._id);

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
        walletBalance: user.walletBalance
      });
    }

    user.walletBalance -= amount;
    await user.save();

    res.status(200).json({
      success:       true,
      walletBalance: user.walletBalance,
      deducted:      amount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};