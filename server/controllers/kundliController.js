const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const { resolveBirthLocation } = require('../services/geoService');
const { calculateVedicChart } = require('../services/vedicChartEngine');

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
    let location;
    try {
      location = await resolveBirthLocation(pob, dob, timeNA ? null : tob);
    } catch (geoErr) {
      if (geoErr.code === 'PLACE_NOT_FOUND') {
        return res.status(400).json({ success: false, message: geoErr.message });
      }
      throw geoErr;
    }

    const chart = calculateVedicChart({
      utcDateTime: location.utcDateTime,
      lat: location.lat,
      lng: location.lng
    });

    const prompt = `You are an expert Vedic astrologer. Using ONLY the real computed chart data below (do not invent or alter any placements), write a warm, insightful personality and life-path analysis for this person. Do not restate the raw numbers — weave them naturally into your interpretation.

Name: ${name}
Gender: ${gender}
Date of Birth: ${dob}
Time of Birth: ${timeNA ? 'Not available (used sunrise default)' : tob}
Place of Birth: ${pob}

Ascendant (Lagna): ${chart.ascendant.rashi}
Moon Sign (Rashi): ${chart.planets.Moon.rashi}
Sun Sign: ${chart.planets.Sun.rashi}
Nakshatra: ${chart.panchang.nakshatra.name}, Pada ${chart.panchang.nakshatra.pada}
Current Mahadasha: ${chart.dasha.current.lord} (${chart.dasha.current.start} to ${chart.dasha.current.end})
Planetary positions: ${Object.entries(chart.planets).map(([p, d]) => `${p} in ${d.rashi}`).join(', ')}

Respond only with valid JSON in this format, no markdown, no preamble:
{"analysis": "..."}`;

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
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

    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiInterpretation = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      name,
      dob,
      tob: timeNA ? 'Sunrise time' : tob,
      pob,
      gender,
      location: {
        lat: location.lat,
        lng: location.lng,
        timezone: location.timezone,
        utcOffsetMinutes: location.utcOffsetMinutes
      },
      ascendant: chart.ascendant,
      planets: chart.planets,
      panchang: chart.panchang,
      dasha: chart.dasha,
      analysis: aiInterpretation.analysis
    });
    


  } catch (err) {
    console.error('Kundli error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};