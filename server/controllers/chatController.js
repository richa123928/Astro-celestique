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
    if (user.walletBalance < 20) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance. Please add funds to continue.',
        code: 'INSUFFICIENT_BALANCE'
      });
    }

    // Deduct per message charge (10 INR per message)
    user.walletBalance -= 20;
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
      model: 'openai/gpt-oss-120b',
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
      charged: 20
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

// @desc    Support chat with AI
// @route   POST /api/chat/support
exports.sendSupportMessage = async (req, res) => {
  try {
    const { message, sessionId, userEmail, userName } = req.body;

    if (!chatHistories[sessionId]) {
      chatHistories[sessionId] = [];
    }

    chatHistories[sessionId].push({
      role: 'user',
      content: message
    });

    if (chatHistories[sessionId].length > 20) {
      chatHistories[sessionId] = chatHistories[sessionId].slice(-20);
    }

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: `You are a friendly customer support agent for Astro Celestique — a premium Vedic astrology platform. 

You help users with:
- Account issues (login, registration, password)
- Payment and wallet issues
- Puja booking queries
- Horoscope and AI chat questions
- Technical problems
- General platform questions

Guidelines:
- Be warm, helpful and professional
- Keep responses concise (2-3 sentences max)
- If you cannot solve the issue, say "Let me connect you with our team"
- Never make up information
- For payment issues always say team will resolve within 24 hours
- For refund requests, say team will process within 3-5 business days
- Platform email: astrocelestique310@gmail.com`
        },
        ...chatHistories[sessionId]
      ],
      temperature: 0.7,
      max_tokens: 256,
    });

    const aiResponse = completion.choices[0].message.content;

    chatHistories[sessionId].push({
      role: 'assistant',
      content: aiResponse
    });

    // Check if AI wants to escalate to team
    const needsHuman = aiResponse.toLowerCase().includes('connect you with our team') ||
                       aiResponse.toLowerCase().includes('our team will') ||
                       aiResponse.toLowerCase().includes('contact our team');

    res.status(200).json({
      success: true,
      message: aiResponse,
      needsHuman
    });

  } catch (err) {
    console.error('Support chat error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Escalate to human support
// @route   POST /api/chat/support/escalate
exports.escalateToHuman = async (req, res) => {
  try {
    const { userEmail, userName, issue, chatHistory } = req.body;

    const { sendEmail } = require('../utils/sendEmail');

    // Email to team
    await sendEmail({
      to: process.env.TEAM_EMAIL,
      subject: `🆘 Support Request — ${userName || 'Guest User'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
          <h2 style="color: #e8b460;">◉ Astro Celestique — Support Request</h2>
          <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p><strong style="color: #8899aa;">User Name:</strong> <span>${userName || 'Guest'}</span></p>
            <p><strong style="color: #8899aa;">User Email:</strong> <span>${userEmail || 'Not provided'}</span></p>
            <p><strong style="color: #8899aa;">Issue:</strong> <span>${issue || 'General support'}</span></p>
          </div>
          <div style="background: #131c30; border: 1px solid rgba(201,150,60,0.15); border-radius: 12px; padding: 20px;">
            <h3 style="color: #e8b460;">Chat History:</h3>
            ${chatHistory?.map(m => `
              <div style="margin: 8px 0; padding: 8px; background: ${m.role === 'user' ? '#1a2540' : '#0d1528'}; border-radius: 8px;">
                <strong style="color: ${m.role === 'user' ? '#4ade80' : '#a89cf0'}">${m.role === 'user' ? 'User' : 'AI'}:</strong>
                <p style="margin: 4px 0; color: #eee8d5;">${m.content}</p>
              </div>
            `).join('') || 'No chat history'}
          </div>
          <p style="color: #8899aa; margin-top: 20px;">Please respond to the user within 24 hours at: <a href="mailto:${userEmail}" style="color: #e8b460;">${userEmail}</a></p>
        </div>
      `
    });

    // Confirmation email to user
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: '✅ Support Request Received — Astro Celestique',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d1528; color: #eee8d5; padding: 32px; border-radius: 16px;">
            <h2 style="color: #e8b460;">◉ Astro Celestique Support</h2>
            <p>Namaste ${userName || 'there'}! 🙏</p>
            <p style="color: #8899aa;">We have received your support request and our team will get back to you within <strong style="color: #eee8d5;">24 hours</strong>.</p>
            <div style="background: rgba(201,150,60,0.1); border: 1px solid rgba(201,150,60,0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="color: #e8b460; margin: 0;">Your Issue: ${issue || 'General support request'}</p>
            </div>
            <p style="color: #8899aa;">For urgent issues, email us at: <a href="mailto:astrocelestique310@gmail.com" style="color: #e8b460;">astrocelestique310@gmail.com</a></p>
            <p style="color: #445566; font-size: 12px; margin-top: 24px;">© 2026 Astro Celestique · Made in Bharat</p>
          </div>
        `
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support request sent to team!'
    });

  } catch (err) {
    console.error('Escalate error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};