const Groq = require('groq-sdk');
const User = require('../models/User');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store chat histories in memory (will move to DB later)
const chatHistories = {};

// @desc    Send message to AI astrologer
// @route   POST /api/chat/ai
exports.sendAIMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user._id.toString();

    // Check wallet balance (minimum 10 INR to chat)
    const user = await User.findById(userId);
    if (user.walletBalance < 5) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please add funds to continue.',
        code: 'INSUFFICIENT_BALANCE'
      });
    }

    // Deduct per message charge (10 INR per message)
    user.walletBalance -= 5;
    await user.save();

    // Initialize chat history for session
    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    // Add user message to history
    chatHistories[sessionId].push({
      role: 'user',
      content: message
    });

    // Keep only last 10 messages for context
    if (chatHistories[sessionId].length > 20) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-20);
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are Jyoti, an expert Vedic astrologer and spiritual guide for Astro Celestique platform. You have deep knowledge of:
- Vedic astrology (Jyotish), planetary transits, dashas, nakshatras
- Kundli analysis, birth chart interpretation
- Remedies, gemstones, mantras, yantras
- Spiritual guidance, karma, dharma
- Relationship compatibility, career guidance

Guidelines:
- Be warm, empathetic and spiritually wise
- Give specific, personalised guidance
- Reference Vedic concepts naturally
- Keep responses concise but insightful (3-4 sentences max)
- If asked about birth details, ask for date, time and place of birth
- Always end with an empowering note
- Speak like a wise guru, not a chatbot`
        },
        ...chatHistories[sessionId]
      ],
      temperature: 0.85,
      max_tokens: 512,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to history
    chatHistories[sessionId].push({
      role: 'assistant',
      content: aiResponse
    });

    res.status(200).json({
      success: true,
      message: aiResponse,
      walletBalance: user.walletBalance,
      charged: 5
    });

  } catch (err) {
    console.error('AI Chat error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/ai/:sessionId
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = chatHistories[sessionId] || [];
    res.status(200).json({
      success: true,
      history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Add funds to wallet
// @route   POST /api/chat/add-funds
exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user._id);
    user.walletBalance += amount;
    await user.save();
    res.status(200).json({
      success: true,
      walletBalance: user.walletBalance,
      message: `₹${amount} added to wallet`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};