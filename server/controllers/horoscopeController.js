const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// @desc    Get horoscope for a sign and type
// @route   GET /api/horoscope/:type/:sign
exports.getHoroscope = async (req, res) => {
  try {
    const { type, sign } = req.params;

    if (!ZODIAC_SIGNS.includes(sign)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid zodiac sign'
      });
    }

    const validTypes = ['daily', 'weekly', 'monthly', 'yearly', 'tomorrow', 'yesterday'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid horoscope type'
      });
    }

    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are a highly skilled Vedic astrologer. Always respond with valid JSON only. No markdown, no backticks, no extra text.'
        },
        {
          role: 'user',
          content: `Generate a ${type} horoscope for ${sign} for ${today}.
          
Return ONLY this JSON structure:
{
  "overview": "2-3 sentences about overall energy",
  "love": "2 sentences about love and relationships",
  "career": "2 sentences about career and finance",
  "health": "2 sentences about health and wellness",
  "luckyColor": "one color",
  "luckyNumber": "one number",
  "luckyDay": "one day of week",
  "rating": 4,
  "affirmation": "one powerful affirmation sentence",
  "planetaryInfluence": "which planet is most influential and why in 1 sentence"
}`
        }
      ],
      temperature: 0.8,
      max_tokens: 1024,
    });

    const text    = completion.choices[0].message.content;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const horoscope = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      sign,
      type,
      date: today,
      horoscope
    });

  } catch (err) {
    console.error('Horoscope error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all signs
// @route   GET /api/horoscope/all/:type
exports.getAllHoroscopes = async (req, res) => {
  try {
    const { type } = req.params;
    res.status(200).json({
      success: true,
      type,
      signs: ZODIAC_SIGNS.map(sign => ({
        sign,
        symbol: getSymbol(sign),
        element: getElement(sign),
        dates: getDates(sign),
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function getSymbol(sign) {
  const symbols = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
  };
  return symbols[sign];
}

function getElement(sign) {
  const elements = {
    Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
    Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
    Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
    Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
  };
  return elements[sign];
}

function getDates(sign) {
  const dates = {
    Aries: 'Mar 21 - Apr 19', Taurus: 'Apr 20 - May 20',
    Gemini: 'May 21 - Jun 20', Cancer: 'Jun 21 - Jul 22',
    Leo: 'Jul 23 - Aug 22', Virgo: 'Aug 23 - Sep 22',
    Libra: 'Sep 23 - Oct 22', Scorpio: 'Oct 23 - Nov 21',
    Sagittarius: 'Nov 22 - Dec 21', Capricorn: 'Dec 22 - Jan 19',
    Aquarius: 'Jan 20 - Feb 18', Pisces: 'Feb 19 - Mar 20'
  };
  return dates[sign];
}