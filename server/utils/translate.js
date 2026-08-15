const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const HINDI_TO_ENGLISH_TERMS = {
  'namaste': 'hello',
  'namaskar': 'hello',
  'namaste ji': 'hello',
  'guruji': 'respected teacher',
  'guru ji': 'respected teacher',
  'pranam': 'greetings',
  'dhanyavaad': 'thank you',
  'dhanyavad': 'thank you',
  'shukriya': 'thank you',
  'aap kaise hain': 'how are you',
  'aap kaise ho': 'how are you',
  'theek hun': 'I am fine',
  'theek hai': 'okay',
  'haan': 'yes',
  'nahi': 'no',
  'nahin': 'no',
};

function containsDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

function applyKnownTermsToEnglish(text) {
  let result = text;
  Object.keys(HINDI_TO_ENGLISH_TERMS).forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, HINDI_TO_ENGLISH_TERMS[term]);
  });
  return result.replace(/\s+/g, ' ').trim();
}

async function callTranslator(text, targetLanguage, senderName, strict = false) {
  const strictNote = strict
    ? `\n\nCRITICAL: Your previous attempt failed to follow instructions. You MUST write your entire response in ${targetLanguage} using ${targetLanguage === 'English' ? 'the Latin/Roman alphabet only, absolutely no Devanagari script' : 'proper script for that language'}. Fully translate every word, including greetings.`
    : '';

  const nameNote = senderName
    ? ` The person's name in this conversation is "${senderName}" — if it appears in the message, keep it EXACTLY as "${senderName}", never translate it as a common word even if it resembles one in another language (for example, a name like "Tia" must stay "Tia", never become a translated word like "aunt").`
    : '';

  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages: [
      {
        role: 'system',
        content: `You are a translator for a live astrology consultation chat between a customer and an astrologer. Translate the message into ${targetLanguage}.

Rules:
- Use simple, natural, everyday spoken language — the way a real person actually talks, NOT formal, archaic, or literary phrasing.
- Never translate proper names (people's names, titles used as names) — keep any person's name exactly as written in the original message.${nameNote}
- Fully translate every other word — don't leave common words or greetings (like "namaste") untranslated.
- Preserve the warmth and casual tone of the original.
- Respond with ONLY the translated text — no quotes, no explanation, no preamble.${strictNote}`
      },
      { role: 'user', content: text }
    ],
    temperature: strict ? 0.1 : 0.3,
    max_tokens: 500,
  });

  return completion.choices[0].message.content.trim();
}

async function translateMessage(text, targetLanguage, senderName = null) {
  if (!text || !text.trim()) return text;

  try {
    let result = await callTranslator(text, targetLanguage, senderName);

    const targetIsEnglish = targetLanguage.toLowerCase() === 'english';
    if (targetIsEnglish && containsDevanagari(result)) {
      result = await callTranslator(text, targetLanguage, senderName, true);
    }

    if (targetIsEnglish) {
      result = applyKnownTermsToEnglish(result);
    }

    return result;
  } catch (err) {
    console.error('Translation error:', err.message);
    return text;
  }
}

module.exports = { translateMessage };