const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @desc    Generate Kundli
// @route   POST /api/kundli/generate
exports.generateKundli = async (req, res) => {
  try {
    const { name, dob, tob, pob, timeNA, gender } = req.body;

    if (!name || !dob || !pob) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, date of birth and place of birth'
      });
    }

    const prompt = `You are an expert Vedic astrologer. Generate a Kundli analysis for:
Name: ${name}
Gender: ${gender}
Date of Birth: ${dob}
Time of Birth: ${timeNA ? 'Not available (use sunrise)' : tob}
Place of Birth: ${pob}

Return ONLY this JSON structure with no extra text:
{
  "rashi": "Moon sign in Sanskrit and English",
  "lagna": "Ascendant sign in Sanskrit and English",
  "nakshatra": "Birth nakshatra name",
  "pada": "Nakshatra pada number (1-4)",
  "tithi": "Current tithi",
  "yoga": "Current yoga",
  "dasha": "Current Mahadasha planet name + Mahadasha",
  "dashaEnd": "Year when current dasha ends",
  "analysis": "A deeply insightful 4-5 sentence Vedic analysis of this person based on their birth details. Include personality traits, karmic patterns, key life themes and spiritual path. Be specific and mystical."
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Vedic astrologer. Always respond with valid JSON only. No markdown, no backticks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const text    = completion.choices[0].message.content;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const kundliData = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      name,
      dob,
      tob: timeNA ? 'Sunrise time' : tob,
      pob,
      gender,
      ...kundliData
    });

  } catch (err) {
    console.error('Kundli error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};