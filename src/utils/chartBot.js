// Chart Bot — clean rewrite
import { RASHI_NAMES } from './astro';

const API = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

const SIGN_TRAITS = [
  'bold, energetic, and pioneering',
  'patient, sensual, and determined',
  'curious, communicative, and adaptable',
  'nurturing, intuitive, and emotional',
  'confident, creative, and generous',
  'analytical, practical, and detail-oriented',
  'balanced, diplomatic, and harmonious',
  'intense, transformative, and perceptive',
  'adventurous, philosophical, and freedom-loving',
  'disciplined, ambitious, and responsible',
  'innovative, independent, and humanitarian',
  'compassionate, spiritual, and empathetic',
];

const HOUSE_THEMES = {
  1:'self and personality', 2:'wealth and family', 3:'communication and courage',
  4:'home and emotions', 5:'creativity and romance', 6:'health and service',
  7:'relationships and partnerships', 8:'transformation and secrets',
  9:'wisdom and fortune', 10:'career and reputation',
  11:'gains and social life', 12:'spirituality and liberation',
};

function getRashi(lon) { return Math.floor(lon / 30); }
function getHouse(p, planets, lagnaSign) { return ((getRashi(planets[p]) - lagnaSign + 12) % 12) + 1; }
function ord(n) { const s=['th','st','nd','rd']; const v=n%100; return s[(v-20)%10]||s[v]||s[0]; }

function safeSign(lon) {
  try { return RASHI_NAMES[getRashi(lon)] || 'Unknown'; } catch { return 'Unknown'; }
}

function buildCtx(chartData) {
  const { planets, lagnaSign, panchanga } = chartData;
  const lagna = RASHI_NAMES[lagnaSign] || 'Unknown';

  return {
    lagna,
    lagnaTraits: SIGN_TRAITS[lagnaSign] || 'unique',
    sunSign:     safeSign(planets.Su),
    sunHouse:    getHouse('Su', planets, lagnaSign),
    moonSign:    safeSign(planets.Mo),
    moonHouse:   getHouse('Mo', planets, lagnaSign),
    venusSign:   safeSign(planets.Ve),
    venusHouse:  getHouse('Ve', planets, lagnaSign),
    marsSign:    safeSign(planets.Ma),
    marsHouse:   getHouse('Ma', planets, lagnaSign),
    jupSign:     safeSign(planets.Jp),
    jupHouse:    getHouse('Jp', planets, lagnaSign),
    satSign:     safeSign(planets.Sa),
    satHouse:    getHouse('Sa', planets, lagnaSign),
    meSign:      safeSign(planets.Me),
    meHouse:     getHouse('Me', planets, lagnaSign),
    rahuHouse:   getHouse('Ra', planets, lagnaSign),
    ketuHouse:   getHouse('Ke', planets, lagnaSign),
    nakshatra:   panchanga?.nakshatra?.name || 'Unknown',
    h7Sign:      RASHI_NAMES[(lagnaSign + 6) % 12] || 'Unknown',
    lagnaSign,
  };
}

function getAnswer(question, ctx) {
  const q = question.toLowerCase();

  if (q.includes('love') || q.includes('marriage') || q.includes('partner') || q.includes('relationship')) {
    return `Your Venus in ${ctx.venusSign} in the ${ctx.venusHouse}${ord(ctx.venusHouse)} house of ${HOUSE_THEMES[ctx.venusHouse]} shapes your approach to love. Your 7th house of marriage falls in ${ctx.h7Sign}. ${
      ctx.venusHouse === 7 ? 'Venus in the 7th is a classic indicator of a loving, harmonious partnership.' :
      ctx.venusHouse === 5 ? 'Venus in the 5th brings romantic joy and creative love.' :
      ctx.venusHouse === 1 ? 'Venus in the 1st gives you natural charm that attracts partners effortlessly.' :
      `Venus here brings Venusian grace to your ${HOUSE_THEMES[ctx.venusHouse]}.`
    } Your Moon in ${ctx.moonSign} shows you need ${
      ['Cancer','Scorpio','Pisces'].includes(ctx.moonSign) ? 'deep emotional connection and security' :
      ['Aries','Leo','Sagittarius'].includes(ctx.moonSign) ? 'passion, excitement, and independence' :
      'stability, intellectual connection, and mutual respect'
    } in relationships.`;
  }

  if (q.includes('career') || q.includes('job') || q.includes('work') || q.includes('profession')) {
    return `Your 10th house of career is in ${RASHI_NAMES[(ctx.lagnaSign + 9) % 12]}. The Sun in ${ctx.sunSign} in your ${ctx.sunHouse}${ord(ctx.sunHouse)} house shapes your professional identity. ${
      ctx.sunHouse === 10 ? 'Sun in the 10th is excellent — you are meant for leadership and recognition.' :
      ctx.sunHouse === 1 ? 'Sun in the 1st makes career central to your identity.' :
      `Your career energy flows through the ${ctx.sunHouse}${ord(ctx.sunHouse)} house of ${HOUSE_THEMES[ctx.sunHouse]}.`
    } Saturn in ${ctx.satSign} in the ${ctx.satHouse}${ord(ctx.satHouse)} house indicates ${
      ctx.satHouse === 10 ? 'great career success through sustained effort and integrity.' :
      ctx.satHouse === 6 ? 'success in service-oriented or competitive fields.' :
      'career growth through discipline and perseverance.'
    }`;
  }

  if (q.includes('health') || q.includes('body') || q.includes('illness') || q.includes('fitness')) {
    return `Your Lagna (${ctx.lagna}) and its lord govern your physical constitution. Mars in ${ctx.marsSign} in the ${ctx.marsHouse}${ord(ctx.marsHouse)} house governs your vitality and energy. ${
      ctx.marsHouse === 1 ? 'Mars in the 1st gives strong physical energy and resilience.' :
      ctx.marsHouse === 6 ? 'Mars in the 6th is excellent for overcoming illness and competition.' :
      `Mars here brings energy to your ${HOUSE_THEMES[ctx.marsHouse]}.`
    } The 6th house of health falls in ${RASHI_NAMES[(ctx.lagnaSign + 5) % 12]}. Maintain regular routines and listen to your body's signals.`;
  }

  if (q.includes('dasha') || q.includes('period') || q.includes('mahadasha')) {
    return `Your Vimshottari Dasha is calculated from your Moon's Nakshatra — ${ctx.nakshatra}. Check the Daśā tab for your complete dasha timeline showing all major and sub-periods. Each dasha activates the themes of that planet in your chart. Your Moon in ${ctx.moonSign} in the ${ctx.moonHouse}${ord(ctx.moonHouse)} house sets the emotional backdrop for all dasha periods.`;
  }

  if (q.includes('yoga') || q.includes('combination') || q.includes('raj yoga')) {
    return `Your chart has several planetary combinations worth noting. Jupiter in ${ctx.jupSign} in the ${ctx.jupHouse}${ord(ctx.jupHouse)} house ${
      [1,4,7,10].includes(ctx.jupHouse) ? 'forms a Gajakesari-type influence — bringing wisdom, fame, and good fortune.' :
      [5,9].includes(ctx.jupHouse) ? 'is in a trikona house — excellent for fortune and spiritual growth.' :
      'brings Jupiter\'s blessings to that area of life.'
    } Check the Yogas tab for a complete analysis of all combinations in your chart.`;
  }

  if (q.includes('remedy') || q.includes('gemstone') || q.includes('mantra') || q.includes('solution')) {
    return `Based on your ${ctx.lagna} Lagna, key remedies include: strengthening your Lagna lord through its gemstone and mantra. Venus in ${ctx.venusSign} — wear Diamond or White Sapphire, chant "Om Shukraya Namah" on Fridays. Jupiter in ${ctx.jupSign} — wear Yellow Sapphire, chant "Om Gurave Namah" on Thursdays. Visit the Remedies tab for complete planet-wise guidance including mantras, charity, and practices.`;
  }

  if (q.includes('spiritual') || q.includes('karma') || q.includes('past life') || q.includes('moksha')) {
    return `Your 9th house of dharma falls in ${RASHI_NAMES[(ctx.lagnaSign + 8) % 12]}, and your 12th house of liberation in ${RASHI_NAMES[(ctx.lagnaSign + 11) % 12]}. Ketu in the ${ctx.ketuHouse}${ord(ctx.ketuHouse)} house indicates past-life wisdom and spiritual inclinations in ${HOUSE_THEMES[ctx.ketuHouse]}. Your birth Nakshatra ${ctx.nakshatra} carries specific spiritual qualities and karmic lessons for this lifetime.`;
  }

  if (q.includes('personality') || q.includes('nature') || q.includes('character') || q.includes('who am i')) {
    return `With ${ctx.lagna} Lagna, you are naturally ${ctx.lagnaTraits}. Your Sun in ${ctx.sunSign} gives you a ${
      ['Aries','Leo','Sagittarius'].includes(ctx.sunSign) ? 'fiery, confident, and expressive' :
      ['Taurus','Virgo','Capricorn'].includes(ctx.sunSign) ? 'grounded, practical, and reliable' :
      ['Gemini','Libra','Aquarius'].includes(ctx.sunSign) ? 'intellectual, social, and communicative' :
      'intuitive, emotional, and perceptive'
    } core identity. Your Moon in ${ctx.moonSign} (${ctx.nakshatra} Nakshatra) shapes your emotional nature and inner world.`;
  }

  if (q.includes('travel') || q.includes('foreign') || q.includes('abroad')) {
    return `Your 9th house of long travel falls in ${RASHI_NAMES[(ctx.lagnaSign + 8) % 12]}, and your 12th house of foreign lands in ${RASHI_NAMES[(ctx.lagnaSign + 11) % 12]}. Rahu in the ${ctx.rahuHouse}${ord(ctx.rahuHouse)} house ${
      ctx.rahuHouse === 9 ? 'strongly indicates foreign travel and international connections.' :
      ctx.rahuHouse === 12 ? 'suggests significant time spent abroad or foreign residence.' :
      ctx.rahuHouse === 7 ? 'indicates foreign partnerships or a partner from a different background.' :
      'brings unconventional travel experiences.'
    }`;
  }

  if (q.includes('education') || q.includes('study') || q.includes('learning') || q.includes('exam')) {
    return `Mercury in ${ctx.meSign} in the ${ctx.meHouse}${ord(ctx.meHouse)} house governs your intellect and learning style. ${
      ctx.meHouse === 1 ? 'Mercury in the 1st makes you articulate and quick-thinking.' :
      ctx.meHouse === 5 ? 'Mercury in the 5th is excellent for education and creative intelligence.' :
      ctx.meHouse === 10 ? 'Mercury in the 10th favors careers in communication, business, or media.' :
      `Mercury here brings intellectual energy to your ${HOUSE_THEMES[ctx.meHouse]}.`
    } Jupiter in ${ctx.jupSign} blesses your higher education and wisdom.`;
  }

  // Default
  return `Your ${ctx.lagna} Lagna chart shows Sun in ${ctx.sunSign} (${ctx.sunHouse}${ord(ctx.sunHouse)} house), Moon in ${ctx.moonSign} (${ctx.moonHouse}${ord(ctx.moonHouse)} house), and ${ctx.nakshatra} Nakshatra. I can answer questions about love, career, health, personality, spirituality, travel, education, dashas, yogas, or remedies. What would you like to know?`;
}

// RAG: calls Gemini on the server
async function fetchRAGAnswer(question, ctx) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${API}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chartContext: ctx }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? { answer: data.answer, sources: data.sources } : null;
  } catch { return null; }
}

export const FOLLOW_UPS = {
  love:    ['What does Venus say about my marriage?', 'What remedies improve my love life?', 'Tell me about my 7th house', 'What is my current dasha?'],
  career:  ['What career suits me best?', 'What does Saturn say about my career?', 'Tell me about my 10th house', 'What yogas help my career?'],
  health:  ['What remedies improve my health?', 'What does Mars say about my energy?', 'Tell me about my 6th house', 'What is my Lagna lord?'],
  dasha:   ['How does my dasha affect love?', 'How does my dasha affect career?', 'What are the sub-periods?', 'What yogas are in my chart?'],
  yogas:   ['What is Gajakesari Yoga?', 'Do I have any Raja Yogas?', 'What remedies strengthen my yogas?', 'Tell me about my Jupiter'],
  remedy:  ['What gemstone should I wear?', 'What mantras should I chant daily?', 'Which planet needs the most attention?', 'Tell me about my Lagna lord'],
  personality: ['What are my strengths?', 'What is my Moon sign personality?', 'Tell me about my career', 'What does my chart say about love?'],
  spiritual:   ['What is my spiritual path?', 'What does Ketu say about past lives?', 'What mantras should I chant?', 'Tell me about my 9th house'],
  travel:      ['Will I settle abroad?', 'Tell me about my 12th house', 'What does Rahu say about foreign travel?', 'Tell me about my career'],
  education:   ['What field of study suits me?', 'When is a good time to study?', 'Tell me about my 5th house', 'What does Jupiter say?'],
  general:     ['What does my chart say about love?', 'Tell me about my career', 'What is my current dasha?', 'What yogas are in my chart?'],
};

function detectTopic(q) {
  const lower = q.toLowerCase();
  if (/love|marriage|partner|relationship|romantic|spouse/.test(lower)) return 'love';
  if (/career|job|work|profession|business|money|wealth/.test(lower)) return 'career';
  if (/health|body|illness|fitness|energy|vitality/.test(lower)) return 'health';
  if (/dasha|period|mahadasha|antardasha/.test(lower)) return 'dasha';
  if (/yoga|combination|raj yoga/.test(lower)) return 'yogas';
  if (/remedy|gemstone|mantra|solution/.test(lower)) return 'remedy';
  if (/personality|nature|character|who am i/.test(lower)) return 'personality';
  if (/spiritual|karma|past life|moksha/.test(lower)) return 'spiritual';
  if (/travel|foreign|abroad/.test(lower)) return 'travel';
  if (/education|study|learning|exam/.test(lower)) return 'education';
  return 'general';
}

export function askChartBot(question, chartData) {
  if (!chartData) {
    return {
      text: 'Please calculate your birth chart first by entering your birth details on the left.',
      followUps: FOLLOW_UPS.general,
      webResults: [],
      ragPromise: null,
    };
  }

  let ctx;
  try {
    ctx = buildCtx(chartData);
  } catch (e) {
    console.error('buildCtx error:', e.message);
    return {
      text: 'I had trouble reading your chart data. Please recalculate your chart and try again.',
      followUps: FOLLOW_UPS.general,
      webResults: [],
      ragPromise: null,
    };
  }

  const topic = detectTopic(question);
  const localText = getAnswer(question, ctx);
  const followUps = FOLLOW_UPS[topic] || FOLLOW_UPS.general;

  // Fire RAG in background
  const ragPromise = fetchRAGAnswer(question, ctx);

  return { text: localText, followUps, webResults: [], ragPromise };
}
