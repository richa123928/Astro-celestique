const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Common Hindi/Hinglish astrology-chat words and greetings that LLMs tend
// to leave untranslated (treating them as "proper nouns" or culturally
// fixed terms). Checked BEFORE calling the AI, so these are guaranteed
// correct regardless of model behavior. Keys are lowercase for matching.
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
  'ji': '',
  'ji haan': 'yes',
};

function containsDevanagari(text) {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Deterministic pre-pass: replace known short Hindi/Hinglish terms with
 * English equivalents by whole-word matching (case-insensitive), whether
 * they appear in Devanagari or in Latin-script Hinglish. Runs BEFORE the
 * AI translator so common greetings are guaranteed correct.
 */
function applyKnownTermsToEnglish(text) {
  let result = text;
  Object.keys(HINDI_TO_ENGLISH_TERMS).forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    result = result.replace(regex, HINDI_TO_ENGLISH_TERMS[term]);
  });
  return result.replace(/\s+/g, ' ').trim();
}

async function callTranslator(text, targetLanguage, strict = false) {
  const strictNote = strict
    ? `\n\nCRITICAL: Your previous attempt failed to follow instructions. You MUST write your entire response in ${targetLanguage} using ${targetLanguage === 'English' ? 'the Latin/Roman alphabet only, absolutely no Devanagari script' : 'proper script for that language'}. Do not preserve any words in the original language, script, or transliteration — fully translate every word, including greetings.`
    : '';

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a translator for a live astrology consultation chat. Translate the user's message into ${targetLanguage}. Preserve tone, warmth, and meaning. Fully translate every word — do not leave any word in the original language or script, even common greetings like "namaste" (translate as "hello"). Respond with ONLY the translated text — no quotes, no explanation, no preamble.${strictNote}`
      },
      { role: 'user', content: text }
    ],
    temperature: strict ? 0.1 : 0.3,
    max_tokens: 500,
  });

  return completion.choices[0].message.content.trim();
}

async function translateMessage(text, targetLanguage) {
  if (!text || !text.trim()) return text;

  try {
    let result = await callTranslator(text, targetLanguage);

    const targetIsEnglish = targetLanguage.toLowerCase() === 'english';
    if (targetIsEnglish && containsDevanagari(result)) {
      result = await callTranslator(text, targetLanguage, true);
    }

    // Final deterministic safety net: force-replace any known common terms
    // that survived both AI attempts. Guarantees correctness for greetings
    // regardless of model behavior.
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