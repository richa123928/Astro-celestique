const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get daily panchang
// @route   POST /api/panchang/daily
exports.getDailyPanchang = async (req, res) => {
  try {
    const { date } = req.body;
    const panchangDate = date || new Date().toISOString().split('T')[0];

    const dateObj = new Date(panchangDate);
    const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'long' });
    const fullDate = dateObj.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const prompt = `You are a Vedic astrologer and Panchang expert. Calculate the Panchang for ${fullDate}.

Return ONLY this JSON with no extra text:
{
  "tithi": "Tithi name and number (e.g. Shukla Dwitiya)",
  "nakshatra": "Nakshatra name (e.g. Rohini)",
  "yoga": "Yoga name (e.g. Saubhagya)",
  "karana": "Karana name (e.g. Bava)",
  "var": "${dayName}",
  "paksha": "Shukla Paksha or Krishna Paksha",
  "vikramSamvat": "Vikram Samvat year and month (e.g. Vikram Samvat 2082, Vaishakha)",
  "planets": [
    {"name": "Sun",     "icon": "☀️", "position": "sign it is in"},
    {"name": "Moon",    "icon": "🌙", "position": "sign it is in"},
    {"name": "Mars",    "icon": "🔴", "position": "sign it is in"},
    {"name": "Mercury", "icon": "💚", "position": "sign it is in"},
    {"name": "Jupiter", "icon": "🟡", "position": "sign it is in"},
    {"name": "Venus",   "icon": "⚪", "position": "sign it is in"},
    {"name": "Saturn",  "icon": "🔵", "position": "sign it is in"},
    {"name": "Rahu",    "icon": "🟣", "position": "sign it is in"},
    {"name": "Ketu",    "icon": "🟤", "position": "sign it is in"}
  ],
  "auspicious": [
    {"label": "Brahma Muhurta", "time": "time range"},
    {"label": "Abhijit Muhurta","time": "time range"},
    {"label": "Vijaya Muhurta", "time": "time range"},
    {"label": "Godhuli Muhurta","time": "time range"}
  ],
  "inauspicious": [
    {"label": "Rahu Kaal",   "time": "time range based on ${dayName}"},
    {"label": "Gulika Kaal", "time": "time range"},
    {"label": "Yamaganda",   "time": "time range"},
    {"label": "Dur Muhurta", "time": "time range"}
  ],
  "guidance": "3 sentences of cosmic guidance and spiritual advice for this day based on the tithi, nakshatra and planetary positions"
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Vedic astrologer and Panchang calculator. Always respond with valid JSON only. No markdown, no backticks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const text    = completion.choices[0].message.content;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const panchangData = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      date: panchangDate,
      ...panchangData
    });

  } catch (err) {
    console.error('Panchang error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};