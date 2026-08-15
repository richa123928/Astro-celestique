const Groq = require('groq-sdk');
const { calculateDailyPanchang } = require('../services/vedicChartEngine');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// @desc    Get daily panchang
// @route   POST /api/panchang/daily
exports.getDailyPanchang = async (req, res) => {
  try {
    const { date, lat, lng, timezone } = req.body;
    const panchangDate = date || new Date().toISOString().split('T')[0];

    // Real computed panchang — defaults to New Delhi if no location given.
    // Tithi/Nakshatra/Yoga/Karana are location-independent; sunrise/sunset
    // and the Rahu Kaal/Muhurta timings DO depend on location, so pass
    // lat/lng through once you add a location picker to the Panchang page.
    const computed = calculateDailyPanchang({
      date: panchangDate,
      lat: lat || 28.6139,
      lng: lng || 77.2090,
      timezone: timezone || 'Asia/Kolkata'
    });

    // AI only writes the interpretive guidance text now, from real data.
    const prompt = `You are an expert Vedic astrologer. Using ONLY the real Panchang data below, write exactly 3 sentences of practical, warm guidance for this day. Do not invent any astrological facts beyond what's given.

Date: ${computed.date} (${computed.var})
Tithi: ${computed.panchang.tithi.label}
Nakshatra: ${computed.panchang.nakshatra.name}, Pada ${computed.panchang.nakshatra.pada}
Yoga: ${computed.panchang.yoga.name}
Karana: ${computed.panchang.karana.name}
Moon sign: ${computed.planets.Moon.rashi}
Sun sign: ${computed.planets.Sun.rashi}
Rahu Kaal (inauspicious): ${computed.inauspicious[0].time}

Respond only with valid JSON, no markdown, no preamble:
{"guidance": "..."}`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Vedic astrologer. Always respond with valid JSON only. No markdown, no backticks.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 300,
    });

    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiGuidance = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      date: computed.date,
      var: computed.var,
      sunrise: computed.sunrise,
      sunset: computed.sunset,
      tithi: computed.panchang.tithi.label,
      paksha: computed.panchang.tithi.paksha,
      nakshatra: computed.panchang.nakshatra.name,
      yoga: computed.panchang.yoga.name,
      karana: computed.panchang.karana.name,
      planets: Object.entries(computed.planets).map(([name, data]) => ({
        name,
        position: data.rashi
      })),
      auspicious: computed.auspicious,
      inauspicious: computed.inauspicious,
      guidance: aiGuidance.guidance
    });

  } catch (err) {
    console.error('Panchang error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};