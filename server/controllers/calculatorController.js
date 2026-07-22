const Groq = require('groq-sdk');
const { getMoonSignAndNakshatra, calculateCompatibility, getMoonPhaseForDate } = require('../services/vedicChartEngine');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── Real Calculations ────────────────────────────────────────────────────────

function getZodiacSign(dob) {
  const date  = new Date(dob);
  const month = date.getMonth() + 1;
  const day   = date.getDate();
  if ((month === 3  && day >= 21) || (month === 4  && day <= 19)) return { en: 'Aries',       sa: 'Mesha' };
  if ((month === 4  && day >= 20) || (month === 5  && day <= 20)) return { en: 'Taurus',      sa: 'Vrishabha' };
  if ((month === 5  && day >= 21) || (month === 6  && day <= 20)) return { en: 'Gemini',      sa: 'Mithuna' };
  if ((month === 6  && day >= 21) || (month === 7  && day <= 22)) return { en: 'Cancer',      sa: 'Karka' };
  if ((month === 7  && day >= 23) || (month === 8  && day <= 22)) return { en: 'Leo',         sa: 'Simha' };
  if ((month === 8  && day >= 23) || (month === 9  && day <= 22)) return { en: 'Virgo',       sa: 'Kanya' };
  if ((month === 9  && day >= 23) || (month === 10 && day <= 22)) return { en: 'Libra',       sa: 'Tula' };
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { en: 'Scorpio',     sa: 'Vrishchika' };
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { en: 'Sagittarius', sa: 'Dhanu' };
  if ((month === 12 && day >= 22) || (month === 1  && day <= 19)) return { en: 'Capricorn',   sa: 'Makara' };
  if ((month === 1  && day >= 20) || (month === 2  && day <= 18)) return { en: 'Aquarius',    sa: 'Kumbha' };
  return { en: 'Pisces', sa: 'Meena' };
}

function getLifePathNumber(dob) {
  const digits = dob.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
}

function getNakshatra(dob) {
  return getMoonSignAndNakshatra(dob).nakshatra.name;
}

function getLoveScore(name1, name2) {
  const combined = (name1 + name2).toLowerCase().replace(/[^a-z]/g, '');
  let score = 0;
  for (let i = 0; i < combined.length; i++) score += combined.charCodeAt(i);
  return (score % 41) + 60;
}

function getCompatibilityScore(dob1, dob2) {
  return calculateCompatibility(dob1, dob2).percentageScore;
}

function getCompatibilityDetails(dob1, dob2) {
  return calculateCompatibility(dob1, dob2);
}

// ── AI Calculator ────────────────────────────────────────────────────────────

const calculate = async (type, data) => {
  const sign       = data.dob   ? getZodiacSign(data.dob)                         : null;
  const sign1      = data.dob1  ? getZodiacSign(data.dob1)                        : null;
  const sign2      = data.dob2  ? getZodiacSign(data.dob2)                        : null;
  const lifePathNo = data.dob && data.name ? getLifePathNumber(data.dob)          : null;
  const nakshatra  = data.dob   ? getNakshatra(data.dob)                          : null;
  const loveScore  = data.name && data.name2 ? getLoveScore(data.name, data.name2): null;
  const compatScore= data.dob1 && data.dob2 ? getCompatibilityScore(data.dob1, data.dob2) : null;
  const compatDetails = data.dob1 && data.dob2 ? getCompatibilityDetails(data.dob1, data.dob2) : null;
  const moonPhaseData = data.date || type === 'moon-phase' ? getMoonPhaseForDate(data.date || new Date().toISOString().split('T')[0]) : null;

  const prompts = {
    'numerology': `You are a Vedic numerologist. Name: "${data.name}", DOB: ${data.dob}.
Life Path Number is ${lifePathNo} (already calculated - use this exact number).
Sun Sign: ${sign?.en} (${sign?.sa}).
Return ONLY this JSON:
{
  "mainResult": "${lifePathNo}",
  "mainLabel": "LIFE PATH NUMBER",
  "details": [
    {"label": "Life Path Number",  "value": "${lifePathNo} - 3 word meaning"},
    {"label": "Destiny Number",    "value": "calculate from name letters and give number + meaning"},
    {"label": "Soul Number",       "value": "calculate from vowels in name and give number + meaning"},
    {"label": "Personality",       "value": "3 key personality traits for life path ${lifePathNo}"},
    {"label": "Lucky Years",       "value": "2-3 upcoming lucky years"},
    {"label": "Compatible Numbers","value": "2-3 compatible life path numbers"}
  ],
  "analysis": "3 deeply insightful sentences about life path ${lifePathNo} for ${data.name}"
}`,

    'moon-sign': `You are a Vedic astrologer. DOB: ${data.dob}. Sun Sign: ${sign?.en} (${sign?.sa}).
Return ONLY this JSON:
{
  "mainResult": "${sign?.sa}",
  "mainLabel": "YOUR RASHI",
  "details": [
    {"label": "Rashi",        "value": "${sign?.sa} (${sign?.en})"},
    {"label": "Element",      "value": "correct element for ${sign?.en}"},
    {"label": "Ruling Planet","value": "correct ruling planet for ${sign?.en}"},
    {"label": "Nakshatra",    "value": "${nakshatra}"},
    {"label": "Personality",  "value": "3 key traits of ${sign?.en}"},
    {"label": "Compatible",   "value": "2 most compatible signs for ${sign?.en}"}
  ],
  "analysis": "3 sentences about ${sign?.en} (${sign?.sa}) personality, karma and life purpose"
}`,

    'rising-sign': `You are a Vedic astrologer. DOB: ${data.dob}. Sun Sign: ${sign?.en} (${sign?.sa}).
Return ONLY this JSON:
{
  "mainResult": "${sign?.sa}",
  "mainLabel": "YOUR LAGNA (APPROXIMATE)",
  "details": [
    {"label": "Lagna",         "value": "${sign?.sa} (${sign?.en}) - approximate without birth time"},
    {"label": "Element",       "value": "element for ${sign?.en}"},
    {"label": "Ruling Planet", "value": "ruling planet for ${sign?.en}"},
    {"label": "Appearance",    "value": "physical traits for ${sign?.en} rising"},
    {"label": "Personality",   "value": "3 traits of ${sign?.en} rising"},
    {"label": "Note",          "value": "For accurate Lagna, birth time is required"}
  ],
  "analysis": "3 sentences about ${sign?.en} Lagna. Note that exact birth time gives precise Lagna."
}`,

    'nakshatra': `You are a Vedic astrologer. DOB: ${data.dob}. Nakshatra: ${nakshatra}. Sun Sign: ${sign?.en}.
Return ONLY this JSON:
{
  "mainResult": "${nakshatra}",
  "mainLabel": "YOUR NAKSHATRA",
  "details": [
    {"label": "Nakshatra",     "value": "${nakshatra}"},
    {"label": "Symbol",        "value": "symbol of ${nakshatra}"},
    {"label": "Ruling Planet", "value": "ruling planet of ${nakshatra}"},
    {"label": "Deity",         "value": "presiding deity of ${nakshatra}"},
    {"label": "Pada",          "value": "most common pada for this date"},
    {"label": "Quality",       "value": "Deva/Manushya/Rakshasa for ${nakshatra}"}
  ],
  "analysis": "3 sentences about ${nakshatra} nakshatra spiritual significance and personality"
}`,

    'love': `You are a Vedic astrologer. Compatibility between ${data.name} and ${data.name2}. Score: ${loveScore}%.
Return ONLY this JSON:
{
  "mainResult": "${loveScore}%",
  "mainLabel": "COMPATIBILITY SCORE",
  "details": [
    {"label": "Emotional Bond",  "value": "${loveScore > 80 ? 'High' : loveScore > 70 ? 'Medium' : 'Low'}"},
    {"label": "Communication",   "value": "${loveScore > 78 ? 'Excellent' : loveScore > 68 ? 'Good' : 'Needs work'}"},
    {"label": "Trust",           "value": "${loveScore > 80 ? 'High' : 'Medium'}"},
    {"label": "Physical",        "value": "${loveScore > 75 ? 'Strong' : 'Moderate'}"},
    {"label": "Long Term",       "value": "${loveScore > 75 ? 'Very Promising' : 'Needs effort'}"},
    {"label": "Karmic Bond",     "value": "${loveScore > 80 ? 'Strong' : loveScore > 70 ? 'Moderate' : 'Weak'}"}
  ],
  "analysis": "3 romantic and insightful sentences about the cosmic connection between ${data.name} and ${data.name2} with ${loveScore}% compatibility"
}`,

    'sade-sati': `You are a Vedic astrologer. DOB: ${data.dob}. Sun Sign: ${sign?.en} (${sign?.sa}). Current year: ${new Date().getFullYear()}.
Return ONLY this JSON:
{
  "mainResult": "Yes or No - is ${sign?.en} under Sade Sati in ${new Date().getFullYear()}",
  "mainLabel": "SADE SATI STATUS",
  "details": [
    {"label": "Status",          "value": "Active or Not Active for ${sign?.en} in ${new Date().getFullYear()}"},
    {"label": "Moon Sign",       "value": "${sign?.sa} (${sign?.en})"},
    {"label": "Saturn Position", "value": "current Saturn transit in ${new Date().getFullYear()}"},
    {"label": "Phase",           "value": "Rising/Peak/Setting if active, else next year"},
    {"label": "Duration",        "value": "years remaining or when next starts"},
    {"label": "Key Remedy",      "value": "most important remedy for ${sign?.en}"}
  ],
  "analysis": "3 sentences about Sade Sati effects for ${sign?.en} and practical guidance"
}`,

    'mangal-dosha': `You are a Vedic astrologer. DOB: ${data.dob}. Sun Sign: ${sign?.en} (${sign?.sa}).
Return ONLY this JSON:
{
  "mainResult": "Yes or No based on ${sign?.en} chart patterns",
  "mainLabel": "MANGAL DOSHA",
  "details": [
    {"label": "Status",        "value": "Present/Absent/Partial for ${sign?.en}"},
    {"label": "Intensity",     "value": "High/Medium/Low or NA"},
    {"label": "Mars Position", "value": "typical Mars house for ${sign?.en}"},
    {"label": "Effect",        "value": "main life area affected"},
    {"label": "Cancellation",  "value": "common cancellation factors for ${sign?.en}"},
    {"label": "Key Remedy",    "value": "most effective remedy"}
  ],
  "analysis": "3 sentences about Mangal Dosha for ${sign?.en} and remedies"
}`,

    'moon-phase': `You are a Vedic astrologer. Real data for ${data.date || new Date().toISOString().split('T')[0]}: Moon phase is ${moonPhaseData.phase}, Tithi is ${moonPhaseData.tithi}.
Return ONLY this JSON:
{
  "mainResult": "${moonPhaseData.phase}",
  "mainLabel": "MOON PHASE",
  "details": [
    {"label": "Phase",        "value": "${moonPhaseData.phase}"},
    {"label": "Tithi",        "value": "${moonPhaseData.tithi}"},
    {"label": "Energy",       "value": "type of cosmic energy for ${moonPhaseData.phase}"},
    {"label": "Best For",     "value": "3 activities suited to ${moonPhaseData.phase}"},
    {"label": "Avoid",        "value": "2 activities to avoid during ${moonPhaseData.phase}"}
  ],
  "analysis": "3 sentences about the spiritual significance of ${moonPhaseData.phase} (${moonPhaseData.tithi})"
}`,

    'compatibility-kundli': `You are a Vedic astrologer. Real computed compatibility data for:
Person 1: ${data.name1}, Moon Sign: ${compatDetails?.person1.rashi}, Nakshatra: ${compatDetails?.person1.nakshatra} (${compatDetails?.person1.gana} Gana)
Person 2: ${data.name2}, Moon Sign: ${compatDetails?.person2.rashi}, Nakshatra: ${compatDetails?.person2.nakshatra} (${compatDetails?.person2.gana} Gana)

Bhakoot (Moon sign compatibility): ${compatDetails?.bhakootPoints}/${compatDetails?.bhakootMax}
Gana (temperament compatibility): ${compatDetails?.ganaPoints}/${compatDetails?.ganaMax}
Total (partial Ashtakoot): ${compatDetails?.totalPoints}/${compatDetails?.maxPoints} (${compatScore}%)

Using ONLY this real data (do not invent scores for factors not listed), write your response.
Return ONLY this JSON:
{
  "mainResult": "${compatDetails?.totalPoints}/${compatDetails?.maxPoints}",
  "mainLabel": "COMPATIBILITY SCORE (PARTIAL ASHTAKOOTA)",
  "details": [
    {"label": "Bhakoot (Moon Sign)", "value": "${compatDetails?.bhakootPoints}/${compatDetails?.bhakootMax} - brief real meaning based on the actual signs given"},
    {"label": "Gana (Temperament)",  "value": "${compatDetails?.ganaPoints}/${compatDetails?.ganaMax} - brief real meaning based on the actual ganas given"},
    {"label": "Note", "value": "Full 36-point Ashtakoota also requires birth time and place for Varna, Vasya, Tara, Yoni, Graha Maitri, and Nadi"}
  ],
  "analysis": "3 sentences about ${data.name1} and ${data.name2}'s compatibility based ONLY on the real Bhakoot and Gana data given above — do not invent additional astrological facts"
}`,

    'compatibility-love': `You are a Vedic astrologer. Calculate love compatibility between:
Person 1: ${data.name1}, DOB: ${data.dob1}, Sign: ${sign1?.en}
Person 2: ${data.name2}, DOB: ${data.dob2}, Sign: ${sign2?.en}
Score: ${compatScore}%.
Return ONLY this JSON:
{
  "mainResult": "${compatScore}%",
  "mainLabel": "LOVE COMPATIBILITY",
  "details": [
    {"label": "Emotional Bond",     "value": "${compatScore > 80 ? 'High' : compatScore > 70 ? 'Medium' : 'Low'}"},
    {"label": "Communication",      "value": "${compatScore > 78 ? 'Excellent' : compatScore > 68 ? 'Good' : 'Needs work'}"},
    {"label": "Trust",              "value": "${compatScore > 80 ? 'High' : 'Medium'}"},
    {"label": "Physical Attraction","value": "${compatScore > 75 ? 'Strong' : 'Moderate'}"},
    {"label": "Long Term Potential","value": "${compatScore > 75 ? 'Very Promising' : 'Needs effort'}"},
    {"label": "Karmic Connection",  "value": "${compatScore > 80 ? 'Strong' : compatScore > 70 ? 'Moderate' : 'Weak'}"}
  ],
  "analysis": "3 romantic and insightful sentences about ${data.name1} and ${data.name2}'s cosmic love potential"
}`,

    'compatibility-zodiac': `You are a Vedic astrologer. Calculate zodiac compatibility between ${data.sign1} and ${data.sign2}.
Return ONLY this JSON:
{
  "mainResult": "compatibility percentage between ${data.sign1} and ${data.sign2}",
  "mainLabel": "ZODIAC COMPATIBILITY",
  "details": [
    {"label": "Nature",         "value": "Natural friends/Neutral/Enemies"},
    {"label": "Element Match",  "value": "Compatible/Neutral/Challenging"},
    {"label": "Ruling Planets", "value": "planet1 and planet2 relationship"},
    {"label": "Love",           "value": "High/Medium/Low"},
    {"label": "Business",       "value": "High/Medium/Low"},
    {"label": "Friendship",     "value": "High/Medium/Low"}
  ],
  "analysis": "3 sentences about ${data.sign1} and ${data.sign2} compatibility in Vedic astrology"
}`,

    'compatibility-friendship': `You are a Vedic astrologer. Calculate friendship compatibility between ${data.name1} and ${data.name2}.
Return ONLY this JSON:
{
  "mainResult": "friendship compatibility percentage",
  "mainLabel": "FRIENDSHIP SCORE",
  "details": [
    {"label": "Understanding", "value": "High/Medium/Low"},
    {"label": "Trust",         "value": "High/Medium/Low"},
    {"label": "Fun Factor",    "value": "High/Medium/Low"},
    {"label": "Support",       "value": "High/Medium/Low"},
    {"label": "Longevity",     "value": "Lifelong/Long term/Short term"},
    {"label": "Karmic Bond",   "value": "Strong/Moderate/Weak"}
  ],
  "analysis": "3 sentences about the cosmic friendship between ${data.name1} and ${data.name2}"
}`
  };

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an expert Vedic astrologer. Always respond with valid JSON only. No markdown, no backticks, no extra text.' },
      { role: 'user',   content: prompts[type] }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const text    = completion.choices[0].message.content;
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

// @desc    Run calculator
// @route   POST /api/calculators/:type
exports.runCalculator = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = [
      'numerology','moon-sign','rising-sign','nakshatra',
      'love','sade-sati','mangal-dosha','moon-phase',
      'compatibility-kundli','compatibility-love',
      'compatibility-zodiac','compatibility-friendship'
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid calculator type' });
    }
    const result = await calculate(type, req.body);
    res.status(200).json({ success: true, type, ...result });
  } catch (err) {
    console.error('Calculator error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};