// Vedic Yoga Detection Engine

function getRashi(lon) { return Math.floor(lon / 30); }
function getHouse(planet, planets, lagnaSign) {
  return ((getRashi(planets[planet]) - lagnaSign + 12) % 12) + 1;
}

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANET_NAMES = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Jp:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu' };

const EXALTATION  = { Su:0, Mo:1, Ma:9, Me:5, Jp:3, Ve:11, Sa:6 };
const DEBILITATION = { Su:6, Mo:7, Ma:3, Me:11, Jp:9, Ve:5, Sa:0 };
const OWN_SIGN    = { Su:[4], Mo:[3], Ma:[0,7], Me:[2,5], Jp:[8,11], Ve:[1,6], Sa:[9,10] };

function isExalted(p, planets)    { return EXALTATION[p]  === getRashi(planets[p]); }
function isDebilitated(p, planets){ return DEBILITATION[p] === getRashi(planets[p]); }
function inOwnSign(p, planets)    { return OWN_SIGN[p]?.includes(getRashi(planets[p])); }
function inKendra(house)          { return [1,4,7,10].includes(house); }
function inTrikona(house)         { return [1,5,9].includes(house); }
function inDusthana(house)        { return [6,8,12].includes(house); }

export function detectYogas(planets, lagnaSign) {
  const yogas = [];
  const h = {};
  for (const p of ['Su','Mo','Ma','Me','Jp','Ve','Sa','Ra','Ke']) {
    h[p] = getHouse(p, planets, lagnaSign);
  }

  // ── Raj Yogas ──
  // Planets in kendra + trikona
  const kendraLords = [1,4,7,10].map(k => signLord((lagnaSign + k - 1) % 12));
  const trikonaLords = [1,5,9].map(t => signLord((lagnaSign + t - 1) % 12));

  for (const kl of kendraLords) {
    for (const tl of trikonaLords) {
      if (kl === tl) continue;
      const klSign = getRashi(planets[kl]);
      const tlSign = getRashi(planets[tl]);
      if (klSign === tlSign) {
        yogas.push({
          name: 'Rāja Yoga',
          type: 'auspicious',
          icon: '👑',
          desc: `${PLANET_NAMES[kl]} (kendra lord) and ${PLANET_NAMES[tl]} (trikona lord) are conjunct in ${SIGN_NAMES[klSign]}. This powerful combination brings authority, success, and recognition.`,
        });
      }
    }
  }

  // ── Gajakesari Yoga ──
  if ([1,4,7,10].includes(Math.abs(h.Jp - h.Mo) % 12 === 0 ? 1 : (h.Jp - h.Mo + 12) % 12 + 1) ||
      h.Jp === h.Mo || [4,7,10].includes((h.Jp - h.Mo + 12) % 12)) {
    yogas.push({
      name: 'Gajakesarī Yoga',
      type: 'auspicious',
      icon: '🐘',
      desc: 'Jupiter is in a kendra from the Moon. This yoga bestows intelligence, fame, wealth, and a noble character. You are likely to be respected and influential.',
    });
  }

  // ── Budhaditya Yoga ──
  if (getRashi(planets.Su) === getRashi(planets.Me)) {
    yogas.push({
      name: 'Budhāditya Yoga',
      type: 'auspicious',
      icon: '☀️',
      desc: `Sun and Mercury are conjunct in ${SIGN_NAMES[getRashi(planets.Su)]}. This yoga gives sharp intellect, excellent communication skills, and success in intellectual pursuits.`,
    });
  }

  // ── Chandra-Mangala Yoga ──
  if (getRashi(planets.Mo) === getRashi(planets.Ma)) {
    yogas.push({
      name: 'Chandra-Maṅgala Yoga',
      type: 'mixed',
      icon: '🌙',
      desc: 'Moon and Mars are conjunct. This yoga gives strong willpower, financial acumen, and the ability to earn through bold ventures. Can also indicate emotional intensity.',
    });
  }

  // ── Hamsa Yoga (Jupiter in own/exalted in kendra) ──
  if ((inOwnSign('Jp', planets) || isExalted('Jp', planets)) && inKendra(h.Jp)) {
    yogas.push({
      name: 'Haṃsa Yoga',
      type: 'auspicious',
      icon: '🦢',
      desc: `Jupiter is ${isExalted('Jp', planets) ? 'exalted' : 'in own sign'} in the ${h.Jp}th house (kendra). This Mahapurusha yoga gives wisdom, spiritual inclination, good fortune, and a noble personality.`,
    });
  }

  // ── Malavya Yoga (Venus in own/exalted in kendra) ──
  if ((inOwnSign('Ve', planets) || isExalted('Ve', planets)) && inKendra(h.Ve)) {
    yogas.push({
      name: 'Mālavya Yoga',
      type: 'auspicious',
      icon: '💎',
      desc: `Venus is ${isExalted('Ve', planets) ? 'exalted' : 'in own sign'} in the ${h.Ve}th house (kendra). This Mahapurusha yoga brings beauty, luxury, artistic talent, and a happy married life.`,
    });
  }

  // ── Ruchaka Yoga (Mars in own/exalted in kendra) ──
  if ((inOwnSign('Ma', planets) || isExalted('Ma', planets)) && inKendra(h.Ma)) {
    yogas.push({
      name: 'Ruchaka Yoga',
      type: 'auspicious',
      icon: '⚔️',
      desc: `Mars is ${isExalted('Ma', planets) ? 'exalted' : 'in own sign'} in the ${h.Ma}th house (kendra). This Mahapurusha yoga gives courage, leadership, physical strength, and success in competitive fields.`,
    });
  }

  // ── Shasha Yoga (Saturn in own/exalted in kendra) ──
  if ((inOwnSign('Sa', planets) || isExalted('Sa', planets)) && inKendra(h.Sa)) {
    yogas.push({
      name: 'Śaśa Yoga',
      type: 'auspicious',
      icon: '🪐',
      desc: `Saturn is ${isExalted('Sa', planets) ? 'exalted' : 'in own sign'} in the ${h.Sa}th house (kendra). This Mahapurusha yoga gives discipline, authority, longevity, and success through hard work.`,
    });
  }

  // ── Bhadra Yoga (Mercury in own/exalted in kendra) ──
  if ((inOwnSign('Me', planets) || isExalted('Me', planets)) && inKendra(h.Me)) {
    yogas.push({
      name: 'Bhadra Yoga',
      type: 'auspicious',
      icon: '📚',
      desc: `Mercury is ${isExalted('Me', planets) ? 'exalted' : 'in own sign'} in the ${h.Me}th house (kendra). This Mahapurusha yoga gives exceptional intelligence, communication skills, and success in business or writing.`,
    });
  }

  // ── Kemadruma Yoga (Moon with no planets adjacent) ──
  const moonSign = getRashi(planets.Mo);
  const prevSign = (moonSign - 1 + 12) % 12;
  const nextSign = (moonSign + 1) % 12;
  const hasAdjacent = ['Su','Ma','Me','Jp','Ve','Sa'].some(p => {
    const s = getRashi(planets[p]);
    return s === prevSign || s === nextSign || s === moonSign;
  });
  if (!hasAdjacent) {
    yogas.push({
      name: 'Kemadruṃa Yoga',
      type: 'challenging',
      icon: '⚠️',
      desc: 'The Moon has no planets in adjacent signs. This yoga can bring emotional isolation, financial instability, or lack of support. Spiritual practice and self-reliance are the remedies.',
    });
  }

  // ── Neecha Bhanga Raj Yoga (debilitated planet cancelled) ──
  for (const [p, debSign] of Object.entries(DEBILITATION)) {
    if (getRashi(planets[p]) === debSign) {
      const debLord = signLord(debSign);
      if (inKendra(h[debLord]) || isExalted(debLord, planets)) {
        yogas.push({
          name: 'Nīcha Bhaṅga Rāja Yoga',
          type: 'auspicious',
          icon: '🔄',
          desc: `${PLANET_NAMES[p]}'s debilitation is cancelled by the strength of ${PLANET_NAMES[debLord]}. This powerful yoga transforms weakness into strength, often bringing unexpected rise and success after initial struggles.`,
        });
      }
    }
  }

  // ── Parivartana Yoga (mutual exchange) ──
  const allPlanets = ['Su','Mo','Ma','Me','Jp','Ve','Sa'];
  for (let i = 0; i < allPlanets.length; i++) {
    for (let j = i+1; j < allPlanets.length; j++) {
      const p1 = allPlanets[i], p2 = allPlanets[j];
      const p1Sign = getRashi(planets[p1]);
      const p2Sign = getRashi(planets[p2]);
      if (OWN_SIGN[p1]?.includes(p2Sign) && OWN_SIGN[p2]?.includes(p1Sign)) {
        yogas.push({
          name: 'Parivartana Yoga',
          type: 'auspicious',
          icon: '🔁',
          desc: `${PLANET_NAMES[p1]} and ${PLANET_NAMES[p2]} are in mutual exchange (Parivartana). This powerful yoga strengthens both planets and the houses they rule, bringing significant results in those life areas.`,
        });
      }
    }
  }

  return yogas.length > 0 ? yogas : [{
    name: 'No Major Yogas Detected',
    type: 'neutral',
    icon: '🔮',
    desc: 'No prominent yogas were found in this chart. This does not diminish the chart — individual planetary strengths and house placements still shape the life significantly.',
  }];
}

function signLord(sign) {
  const lords = ['Ma','Ve','Me','Mo','Su','Me','Ve','Ma','Jp','Sa','Sa','Jp'];
  return lords[sign];
}

export { PLANET_NAMES as YOGA_PLANET_NAMES };
