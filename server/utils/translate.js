const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Detect language and translate
exports.translateMessage = async (text, targetLang) => {
  try {
    const prompt = targetLang === 'hindi'
      ? `Translate this English text to Hindi (Devanagari script). Return ONLY the translated text, nothing else:\n\n"${text}"`
      : `Translate this Hindi text to English. Return ONLY the translated text, nothing else:\n\n"${text}"`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a professional translator. Return ONLY the translated text with no explanation, no quotes, no extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('Translation error:', err.message);
    return text; // Return original if translation fails
  }
};

// Detect if text is Hindi or English
exports.detectLanguage = (text) => {
  const hindiPattern = /[\u0900-\u097F]/;
  return hindiPattern.test(text) ? 'hindi' : 'english';
};