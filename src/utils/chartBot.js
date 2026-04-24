// Chart Bot — answers questions based on natal chart data
import { RASHIS, RASHI_NAMES, NAKSHATRA_NAMES, NAKSHATRA_LORDS } from './astro';
import { HOUSE_THEMES, PLANET_NAMES } from './transits';
import { detectYogas } from './yogas';
import { calcVimshottariDasha, getCurrentDasha, formatDashaDate } from './dasha';

const SIGN_TRAITS = {
  0:'bold, energetic, and pioneering',1:'patient, sensual, and determined',
  2:'curious, communicative, and adaptable',3:'nurturing, intuitive, and emotional',
  4:'confident, creative, and generous',5:'analytical, practical, and detail-oriented',
  6:'balanced, diplomatic, and harmonious',7:'intense, transformative, and perceptive',
  8:'adventurous, philosophical, and freedom-loving',9:'disciplined, ambitious, and responsible',
  10:'innovative, independent, and humanitarian',11:'compassionate, spiritual, and empathetic',
};

const PLANET_FULL = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Jp:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu', As:'Lagna' };
const EXALTATION  = { Su:0, Mo:1, Ma:9, Me:5, Jp:3, Ve:11, Sa:6 };
const DEBILITATION = { Su:6, Mo:7, Ma:3, Me:11, Jp:9, Ve:5, Sa:0 };
const OWN_SIGN    = { Su:[4], Mo:[3], Ma:[0,7], Me:[2,5], Jp:[8,11], Ve:[1,6], Sa:[9,10] };

function getRashi(lon) { return Math.floor(lon / 30); }
function getHouse(p, planets, lagnaSign) { return ((getRashi(planets[p]) - lagnaSign + 12) % 12) + 1; }
function ord(n) { const s=['th','st','nd','rd']; const v=n%100; return s[(v-20)%10]||s[v]||s[0]; }

function strength(p, planets) {
  const sign = getRashi(planets[p]);
  if (EXALTATION[p] === sign) return 'exalted (very strong)';
  if (DEBILITATION[p] === sign) return 'debilitated (weakened)';
  if (OWN_SIGN[p]?.includes(sign)) return 'in own sign (strong)';
  return 'in neutral sign';
}

function buildContext(chartData) {
  const { planets, lagnaSign, panchanga } = chartData;
  const birthDate = chartData.meta?.date instanceof Date ? chartData.meta.date : new Date(chartData.meta?.date || Date.now());

  const dashas = calcVimshottariDasha(planets.Mo, birthDate, 120);
  const current = getCurrentDasha(dashas, new Date());
  const yogas = detectYogas(planets, lagnaSign);

  return {
    lagna: RASHI_NAMES[lagnaSign],
    lagnaTraits: SIGN_TRAITS[lagnaSign],
    sun: { sign: RASHI_NAMES[getRashi(planets.Su)], house: getHouse('Su', planets, lagnaSign), strength: strength('Su', planets) },
    moon: { sign: RASHI_NAMES[getRashi(planets.Mo)], house: getHouse('Mo', planets, lagnaSign), strength: strength('Mo', planets), nakshatra: panchanga?.nakshatra?.name },
    mars: { sign: RASHI_NAMES[getRashi(planets.Ma)], house: getHouse('Ma', planets, lagnaSign), strength: strength('Ma', planets) },
    mercury: { sign: RASHI_NAMES[getRashi(planets.Me)], house: getHouse('Me', planets, lagnaSign), strength: strength('Me', planets) },
    jupiter: { sign: RASHI_NAMES[getRashi(planets.Jp)], house: getHouse('Jp', planets, lagnaSign), strength: strength('Jp', planets) },
    venus: { sign: RASHI_NAMES[getRashi(planets.Ve)], house: getHouse('Ve', planets, lagnaSign), strength: strength('Ve', planets) },
    saturn: { sign: RASHI_NAMES[getRashi(planets.Sa)], house: getHouse('Sa', planets, lagnaSign), strength: strength('Sa', planets) },
    rahu: { sign: RASHI_NAMES[getRashi(planets.Ra)], house: getHouse('Ra', planets, lagnaSign) },
    ketu: { sign: RASHI_NAMES[getRashi(planets.Ke)], house: getHouse('Ke', planets, lagnaSign) },
    currentDasha: current ? `${current.maha.name} Mahādaśā / ${current.antar?.name || ''} Antardaśā (until ${formatDashaDate(current.maha.end)})` : 'Unknown',
    yogas: yogas.filter(y => y.type === 'auspicious').map(y => y.name).join(', ') || 'None detected',
    h10: HOUSE_THEMES[10],
    h7: HOUSE_THEMES[7],
    h5: HOUSE_THEMES[5],
  };
}

const TOPIC_PATTERNS = [
  { keywords: ['love','relationship','marriage','partner','spouse','romantic','heart','soulmate'], topic: 'love' },
  { keywords: ['career','job','work','profession','business','success','money','wealth','finance','income'], topic: 'career' },
  { keywords: ['health','body','illness','disease','fitness','energy','vitality'], topic: 'health' },
  { keywords: ['family','mother','father','children','child','home','house'], topic: 'family' },
  { keywords: ['travel','foreign','abroad','journey','move','relocate'], topic: 'travel' },
  { keywords: ['spiritual','meditation','moksha','liberation','karma','past life'], topic: 'spiritual' },
  { keywords: ['education','study','learning','knowledge','exam','degree'], topic: 'education' },
  { keywords: ['dasha','period','mahadasha','antardasha','current period'], topic: 'dasha' },
  { keywords: ['yoga','combination','raj yoga','special'], topic: 'yogas' },
  { keywords: ['remedy','gemstone','mantra','solution','fix','improve'], topic: 'remedy' },
  { keywords: ['personality','nature','character','who am i','about me'], topic: 'personality' },
  { keywords: ['today','daily','this week','this month','forecast','transit'], topic: 'forecast' },
];

function detectTopic(question) {
  const q = question.toLowerCase();
  for (const { keywords, topic } of TOPIC_PATTERNS) {
    if (keywords.some(k => q.includes(k))) return topic;
  }
  return 'general';
}

function generateAnswer(topic, ctx, question) {
  switch (topic) {
    case 'love':
      return `Based on your chart, Venus is in ${ctx.venus.sign} in your ${ctx.venus.house}${ord(ctx.venus.house)} house (${ctx.venus.strength}). Your 7th house of relationships is in ${RASHI_NAMES[(parseInt(ctx.lagna === 'Aries' ? 0 : RASHI_NAMES.indexOf(ctx.lagna)) + 6) % 12] || 'the opposite sign'}. ${
        ctx.venus.house === 7 ? 'Venus in the 7th is a beautiful indicator of a loving, harmonious partnership.' :
        ctx.venus.house === 5 ? 'Venus in the 5th house brings romantic joy and creative love.' :
        ctx.venus.house === 1 ? 'Venus in the 1st gives you natural charm that attracts partners effortlessly.' :
        `Venus in the ${ctx.venus.house}${ord(ctx.venus.house)} house shapes your love life through themes of ${HOUSE_THEMES[ctx.venus.house]}.`
      } Your Moon in ${ctx.moon.sign} reveals you need ${
        ['Cancer','Scorpio','Pisces'].includes(ctx.moon.sign) ? 'deep emotional connection and security' :
        ['Aries','Leo','Sagittarius'].includes(ctx.moon.sign) ? 'passion, excitement, and independence' :
        'stability, intellectual connection, and mutual respect'
      } in relationships. Currently in ${ctx.currentDasha}, ${
        ctx.currentDasha.includes('Venus') ? 'this is an especially favorable period for love and relationships.' :
        ctx.currentDasha.includes('Saturn') ? 'relationships may require patience and maturity right now.' :
        ctx.currentDasha.includes('Jupiter') ? 'Jupiter\'s blessings support growth and expansion in your love life.' :
        'focus on communication and understanding with your partner.'
      }`;

    case 'career':
      return `Your 10th house of career is influenced by your ${ctx.lagna} Lagna. The Sun in ${ctx.sun.sign} (${ctx.sun.strength}) in your ${ctx.sun.house}${ord(ctx.sun.house)} house shapes your professional identity. ${
        ctx.sun.house === 10 ? 'Sun in the 10th is excellent for career — you are meant for leadership and public recognition.' :
        ctx.sun.house === 1 ? 'Sun in the 1st makes career central to your identity.' :
        `Your career energy flows through the ${ctx.sun.house}${ord(ctx.sun.house)} house themes.`
      } Saturn in ${ctx.saturn.sign} (${ctx.saturn.strength}) in your ${ctx.saturn.house}${ord(ctx.saturn.house)} house indicates ${
        ctx.saturn.house === 10 ? 'great career success through sustained effort and integrity.' :
        ctx.saturn.house === 6 ? 'success in service-oriented or competitive fields.' :
        'career growth through discipline and perseverance.'
      } Currently in ${ctx.currentDasha} — ${
        ctx.currentDasha.includes('Saturn') ? 'this is a karmic career period. Hard work now builds lasting foundations.' :
        ctx.currentDasha.includes('Jupiter') ? 'Jupiter\'s period brings expansion and new opportunities in your career.' :
        ctx.currentDasha.includes('Sun') ? 'the Sun period boosts recognition and authority in your field.' :
        'focus on consistent effort and skill-building during this period.'
      }`;

    case 'health':
      return `Your Lagna (${ctx.lagna}) and its lord indicate your physical constitution. Mars in ${ctx.mars.sign} (${ctx.mars.strength}) in your ${ctx.mars.house}${ord(ctx.mars.house)} house governs your vitality and energy levels. ${
        ctx.mars.strength.includes('exalted') ? 'Strong Mars gives excellent physical energy and resilience.' :
        ctx.mars.strength.includes('debilitated') ? 'Weakened Mars may indicate lower energy — regular exercise and iron-rich foods help.' :
        'Mars in neutral position gives moderate physical energy.'
      } The 6th house of health is activated by ${ctx.moon.sign} Moon energy. ${
        ctx.currentDasha.includes('Saturn') ? 'During Saturn\'s period, pay attention to bones, joints, and chronic conditions. Regular routine and rest are essential.' :
        ctx.currentDasha.includes('Mars') ? 'Mars period can bring accidents or inflammation — stay grounded and avoid recklessness.' :
        ctx.currentDasha.includes('Moon') ? 'Moon period affects emotional health — mental wellness and sleep are priorities.' :
        'Maintain regular health routines and listen to your body\'s signals.'
      }`;

    case 'dasha':
      return `You are currently running ${ctx.currentDasha}. ${
        ctx.currentDasha.includes('Jupiter') ? 'Jupiter\'s period (16 years) is generally auspicious — expect growth, wisdom, and expansion in life. Education, spirituality, and good fortune are highlighted.' :
        ctx.currentDasha.includes('Saturn') ? 'Saturn\'s period (19 years) is karmic and transformative. It rewards discipline and hard work while testing patience. Long-term foundations are built during this time.' :
        ctx.currentDasha.includes('Venus') ? 'Venus\'s period (20 years) is the longest and often brings comfort, relationships, arts, and material pleasures. Love and beauty are highlighted.' :
        ctx.currentDasha.includes('Sun') ? 'Sun\'s period (6 years) brings focus on self, career, and authority. Recognition and leadership opportunities arise.' :
        ctx.currentDasha.includes('Moon') ? 'Moon\'s period (10 years) heightens emotions, intuition, and family matters. Travel and changes in residence are common.' :
        ctx.currentDasha.includes('Mars') ? 'Mars\'s period (7 years) brings energy, ambition, and action. Property, siblings, and competitive endeavors are highlighted.' :
        ctx.currentDasha.includes('Mercury') ? 'Mercury\'s period (17 years) favors intellect, communication, business, and education.' :
        ctx.currentDasha.includes('Rahu') ? 'Rahu\'s period (18 years) brings ambition, foreign connections, and unconventional paths. Transformation and material desires are strong.' :
        ctx.currentDasha.includes('Ketu') ? 'Ketu\'s period (7 years) is spiritual and introspective. Detachment, past karma, and inner wisdom are themes.' :
        'Your current dasha shapes the overall themes of this life phase.'
      } The sub-period (Antardasha) further refines these themes on a shorter timescale.`;

    case 'yogas':
      return `Your chart contains these notable yogas: ${ctx.yogas || 'no major yogas detected'}. ${
        ctx.yogas.includes('Gajakesari') ? 'Gajakesari Yoga (Jupiter-Moon) gives intelligence, fame, and noble character. ' : ''
      }${
        ctx.yogas.includes('Budhaditya') ? 'Budhāditya Yoga (Sun-Mercury) gives sharp intellect and communication skills. ' : ''
      }${
        ctx.yogas.includes('Raja') ? 'Rāja Yoga indicates potential for authority, success, and recognition. ' : ''
      }These yogas activate most powerfully during the dashas of the planets involved.`;

    case 'remedy':
      return `Based on your chart, here are key remedies: ${
        ctx.sun.strength.includes('debilitated') ? 'For the Sun: wear Ruby, chant "Om Hrāṃ Hrīṃ Hraum Saḥ Sūryāya Namaḥ" 108 times on Sundays, and offer water to the Sun at sunrise. ' : ''
      }${
        ctx.moon.strength.includes('debilitated') ? 'For the Moon: wear Pearl or Moonstone, chant "Om Śrāṃ Śrīṃ Śraum Saḥ Chandrāya Namaḥ" on Mondays, and drink water from a silver vessel. ' : ''
      }${
        ctx.jupiter.strength.includes('debilitated') ? 'For Jupiter: wear Yellow Sapphire, chant "Om Grāṃ Grīṃ Graum Saḥ Guruve Namaḥ" on Thursdays, and respect teachers. ' : ''
      }General remedies: meditate daily, practice gratitude, and perform charity on the day of your Lagna lord (${ctx.lagna}). Visit the Remedies tab for complete planet-wise guidance.`;

    case 'personality':
      return `With ${ctx.lagna} Lagna, you are naturally ${ctx.lagnaTraits}. Your Sun in ${ctx.sun.sign} gives you a ${
        ['Aries','Leo','Sagittarius'].includes(ctx.sun.sign) ? 'fiery, confident, and expressive' :
        ['Taurus','Virgo','Capricorn'].includes(ctx.sun.sign) ? 'grounded, practical, and reliable' :
        ['Gemini','Libra','Aquarius'].includes(ctx.sun.sign) ? 'intellectual, social, and communicative' :
        'intuitive, emotional, and perceptive'
      } core identity. Your Moon in ${ctx.moon.sign} (${ctx.moon.nakshatra || 'your birth nakshatra'}) shapes your emotional nature — you process feelings in a ${
        ['Cancer','Scorpio','Pisces'].includes(ctx.moon.sign) ? 'deep, sensitive, and empathetic' :
        ['Aries','Leo','Sagittarius'].includes(ctx.moon.sign) ? 'passionate, expressive, and direct' :
        'thoughtful, measured, and analytical'
      } way. Together, your Lagna, Sun, and Moon create a unique personality that is ${ctx.lagnaTraits}.`;

    case 'spiritual':
      return `Your 9th house (dharma and spirituality) and 12th house (liberation) are key. Ketu in ${ctx.ketu.sign} in your ${ctx.ketu.house}${ord(ctx.ketu.house)} house indicates past-life spiritual wisdom and a natural inclination toward ${
        ctx.ketu.house === 12 ? 'moksha, meditation, and transcendence' :
        ctx.ketu.house === 9 ? 'deep philosophical inquiry and spiritual teaching' :
        ctx.ketu.house === 8 ? 'occult knowledge and transformative spiritual experiences' :
        'spiritual detachment and inner wisdom'
      }. Jupiter in ${ctx.jupiter.sign} (${ctx.jupiter.strength}) guides your spiritual path through ${
        ctx.jupiter.strength.includes('exalted') ? 'exceptional wisdom and divine grace' :
        ctx.jupiter.strength.includes('own') ? 'natural philosophical depth and teaching ability' :
        'steady spiritual growth and learning'
      }. Your birth nakshatra ${ctx.moon.nakshatra || ''} carries specific spiritual qualities and karmic lessons.`;

    case 'education':
      return `Mercury in ${ctx.mercury.sign} (${ctx.mercury.strength}) in your ${ctx.mercury.house}${ord(ctx.mercury.house)} house governs your intellect and learning style. ${
        ctx.mercury.strength.includes('exalted') ? 'Exalted Mercury gives exceptional analytical and communication abilities.' :
        ctx.mercury.strength.includes('own') ? 'Mercury in own sign gives sharp, versatile intelligence.' :
        ctx.mercury.strength.includes('debilitated') ? 'Mercury needs support — structured study methods and patience help.' :
        'Mercury gives good intellectual capacity.'
      } Jupiter in ${ctx.jupiter.sign} blesses your higher education and wisdom. ${
        ctx.currentDasha.includes('Mercury') ? 'Mercury\'s current dasha is excellent for studies, exams, and intellectual pursuits.' :
        ctx.currentDasha.includes('Jupiter') ? 'Jupiter\'s period supports higher education, teaching, and philosophical studies.' :
        'Focus on consistent study habits and seek good teachers during this period.'
      }`;

    case 'travel':
      return `Your 9th house (long travel, foreign lands) and 12th house (foreign residence) are key indicators. Rahu in ${ctx.rahu.sign} in your ${ctx.rahu.house}${ord(ctx.rahu.house)} house ${
        ctx.rahu.house === 9 ? 'strongly indicates foreign travel and connections with people from different cultures.' :
        ctx.rahu.house === 12 ? 'suggests foreign residence or significant time spent abroad.' :
        ctx.rahu.house === 7 ? 'indicates foreign partnerships or a partner from a different background.' :
        'brings unconventional travel experiences.'
      } ${
        ctx.currentDasha.includes('Rahu') ? 'Rahu\'s current period is especially favorable for foreign travel and international opportunities.' :
        ctx.currentDasha.includes('Jupiter') ? 'Jupiter\'s period supports long-distance travel and spiritual journeys.' :
        'Look for travel opportunities during favorable transit periods.'
      }`;

    case 'forecast':
      return `For current planetary influences, please check the "Forecast" tab which shows daily, weekly, and monthly transit predictions based on your natal chart. The transiting planets interact with your natal positions to create the themes of each period. Your current ${ctx.currentDasha} sets the overall backdrop for all forecasts.`;

    default:
      return `Based on your ${ctx.lagna} Lagna chart, with Sun in ${ctx.sun.sign} (${ctx.sun.house}${ord(ctx.sun.house)} house), Moon in ${ctx.moon.sign} (${ctx.moon.house}${ord(ctx.moon.house)} house), and currently running ${ctx.currentDasha}, your chart shows a unique combination of energies. Could you be more specific about what aspect of your life you'd like guidance on? I can help with love, career, health, family, spirituality, education, travel, dashas, yogas, or remedies.`;
  }
}

const API = typeof import.meta !== 'undefined'
  ? (import.meta.env?.VITE_API_URL || 'http://localhost:3001')
  : 'http://localhost:3001';

async function fetchWebInsights(question, chartContext) {
  try {
    const res = await fetch(`${API}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chartContext }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.results?.length > 0 ? data.results : null;
  } catch {
    return null;
  }
}

export async function askChartBot(question, chartData) {
  if (!chartData) return { text: "Please calculate your birth chart first by entering your birth details on the left.", followUps: [] };
  const ctx = buildContext(chartData);
  const topic = detectTopic(question);
  const text = generateAnswer(topic, ctx, question);
  const followUps = FOLLOW_UPS[topic] || FOLLOW_UPS.general;

  // Fetch web insights in parallel
  const webResults = await fetchWebInsights(question, {
    lagna: ctx.lagna, sun: ctx.sun, moon: ctx.moon, currentDasha: ctx.currentDasha,
  });

  return { text, followUps, webResults };
}

const RASHI_NAMES_LOCAL = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
