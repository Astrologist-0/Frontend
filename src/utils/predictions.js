// Vedic Astrology Predictions Engine

const SIGN_TRAITS = {
  0:  { name: 'Aries',       element: 'Fire',  quality: 'Cardinal', lord: 'Ma' },
  1:  { name: 'Taurus',      element: 'Earth', quality: 'Fixed',    lord: 'Ve' },
  2:  { name: 'Gemini',      element: 'Air',   quality: 'Mutable',  lord: 'Me' },
  3:  { name: 'Cancer',      element: 'Water', quality: 'Cardinal', lord: 'Mo' },
  4:  { name: 'Leo',         element: 'Fire',  quality: 'Fixed',    lord: 'Su' },
  5:  { name: 'Virgo',       element: 'Earth', quality: 'Mutable',  lord: 'Me' },
  6:  { name: 'Libra',       element: 'Air',   quality: 'Cardinal', lord: 'Ve' },
  7:  { name: 'Scorpio',     element: 'Water', quality: 'Fixed',    lord: 'Ma' },
  8:  { name: 'Sagittarius', element: 'Fire',  quality: 'Mutable',  lord: 'Jp' },
  9:  { name: 'Capricorn',   element: 'Earth', quality: 'Cardinal', lord: 'Sa' },
  10: { name: 'Aquarius',    element: 'Air',   quality: 'Fixed',    lord: 'Sa' },
  11: { name: 'Pisces',      element: 'Water', quality: 'Mutable',  lord: 'Jp' },
};

const PLANET_NAMES = {
  Su: 'Sun', Mo: 'Moon', Ma: 'Mars', Me: 'Mercury',
  Jp: 'Jupiter', Ve: 'Venus', Sa: 'Saturn', Ra: 'Rahu', Ke: 'Ketu', As: 'Lagna'
};

const HOUSE_MEANINGS = {
  1:  'self, personality, and physical body',
  2:  'wealth, family, and speech',
  3:  'courage, siblings, and communication',
  4:  'home, mother, and inner peace',
  5:  'intelligence, children, and creativity',
  6:  'health, enemies, and service',
  7:  'marriage, partnerships, and business',
  8:  'transformation, longevity, and hidden matters',
  9:  'fortune, dharma, and higher wisdom',
  10: 'career, status, and public life',
  11: 'gains, desires, and social network',
  12: 'liberation, losses, and foreign lands',
};

// Exaltation / Debilitation signs
const EXALTATION  = { Su: 0, Mo: 1, Ma: 9, Me: 5, Jp: 3, Ve: 11, Sa: 6 };
const DEBILITATION = { Su: 6, Mo: 7, Ma: 3, Me: 11, Jp: 9, Ve: 5, Sa: 0 };
const OWN_SIGN = {
  Su: [4], Mo: [3], Ma: [0, 7], Me: [2, 5], Jp: [8, 11], Ve: [1, 6], Sa: [9, 10]
};

function getPlanetStrength(planet, sign) {
  if (EXALTATION[planet] === sign) return 'exalted';
  if (DEBILITATION[planet] === sign) return 'debilitated';
  if (OWN_SIGN[planet]?.includes(sign)) return 'own sign';
  return null;
}

function getHouse(planet, planets, lagnaSign) {
  const sign = Math.floor(planets[planet] / 30);
  return ((sign - lagnaSign + 12) % 12) + 1;
}

export function generatePredictions(chartData) {
  const { planets, lagnaSign, panchanga } = chartData;
  const predictions = [];

  const lagnaSign_ = lagnaSign;
  const lagnaTrait = SIGN_TRAITS[lagnaSign_];

  // 1. Lagna / Ascendant reading
  predictions.push({
    category: 'Personality',
    icon: '🌟',
    title: `${lagnaTrait.name} Ascendant`,
    text: `Your Lagna is in ${lagnaTrait.name}, a ${lagnaTrait.element} sign ruled by ${PLANET_NAMES[lagnaTrait.lord]}. You carry a ${lagnaTrait.quality.toLowerCase()} energy — ${
      lagnaTrait.element === 'Fire' ? 'dynamic, bold, and action-oriented' :
      lagnaTrait.element === 'Earth' ? 'grounded, practical, and reliable' :
      lagnaTrait.element === 'Air' ? 'intellectual, communicative, and adaptable' :
      'intuitive, emotional, and perceptive'
    }. The ${lagnaTrait.quality} quality makes you ${
      lagnaTrait.quality === 'Cardinal' ? 'a natural initiator who starts new ventures' :
      lagnaTrait.quality === 'Fixed' ? 'persistent and determined in your pursuits' :
      'flexible and versatile in changing situations'
    }.`,
  });

  // 2. Sun sign reading
  const sunSign = Math.floor(planets.Su / 30);
  const sunHouse = getHouse('Su', planets, lagnaSign_);
  const sunStrength = getPlanetStrength('Su', sunSign);
  predictions.push({
    category: 'Soul & Purpose',
    icon: '☀️',
    title: `Sun in ${SIGN_TRAITS[sunSign].name} (House ${sunHouse})`,
    text: `Your Sun in ${SIGN_TRAITS[sunSign].name} in the ${sunHouse}${ordinal(sunHouse)} house shapes your core identity and life purpose around ${HOUSE_MEANINGS[sunHouse]}. ${
      sunStrength ? `The Sun is ${sunStrength} here, making this influence especially ${sunStrength === 'exalted' ? 'powerful and beneficial' : 'challenging and karmic'}.` : ''
    } You are driven to shine through ${HOUSE_MEANINGS[sunHouse]}.`,
  });

  // 3. Moon sign reading
  const moonSign = Math.floor(planets.Mo / 30);
  const moonHouse = getHouse('Mo', planets, lagnaSign_);
  const moonStrength = getPlanetStrength('Mo', moonSign);
  predictions.push({
    category: 'Mind & Emotions',
    icon: '🌙',
    title: `Moon in ${SIGN_TRAITS[moonSign].name} (House ${moonHouse})`,
    text: `Your Moon in ${SIGN_TRAITS[moonSign].name} reveals an ${SIGN_TRAITS[moonSign].element.toLowerCase()}-natured emotional world. Placed in the ${moonHouse}${ordinal(moonHouse)} house of ${HOUSE_MEANINGS[moonHouse]}, your mind finds comfort and security through these themes. ${
      moonStrength ? `The Moon is ${moonStrength} here — ${moonStrength === 'exalted' ? 'your emotional intelligence is heightened' : 'emotional challenges may require conscious effort to overcome'}.` : ''
    }`,
  });

  // 4. Jupiter reading (fortune & wisdom)
  const jpSign = Math.floor(planets.Jp / 30);
  const jpHouse = getHouse('Jp', planets, lagnaSign_);
  const jpStrength = getPlanetStrength('Jp', jpSign);
  predictions.push({
    category: 'Fortune & Wisdom',
    icon: '🪐',
    title: `Jupiter in ${SIGN_TRAITS[jpSign].name} (House ${jpHouse})`,
    text: `Jupiter, the planet of expansion and wisdom, sits in ${SIGN_TRAITS[jpSign].name} in your ${jpHouse}${ordinal(jpHouse)} house. This brings blessings and growth to ${HOUSE_MEANINGS[jpHouse]}. ${
      jpStrength === 'exalted' ? 'Jupiter is exalted here — exceptional fortune, wisdom, and spiritual growth are indicated.' :
      jpStrength === 'debilitated' ? 'Jupiter is debilitated — wisdom comes through overcoming obstacles and humility.' :
      jpStrength === 'own sign' ? 'Jupiter is in its own sign — natural abundance and philosophical depth.' :
      `Jupiter expands the themes of the ${jpHouse}${ordinal(jpHouse)} house in your life.`
    }`,
  });

  // 5. Venus reading (love & wealth)
  const veSign = Math.floor(planets.Ve / 30);
  const veHouse = getHouse('Ve', planets, lagnaSign_);
  const veStrength = getPlanetStrength('Ve', veSign);
  predictions.push({
    category: 'Love & Wealth',
    icon: '💫',
    title: `Venus in ${SIGN_TRAITS[veSign].name} (House ${veHouse})`,
    text: `Venus governs love, beauty, and material comforts. In ${SIGN_TRAITS[veSign].name} and the ${veHouse}${ordinal(veHouse)} house of ${HOUSE_MEANINGS[veHouse]}, your approach to relationships and wealth is colored by ${SIGN_TRAITS[veSign].element.toLowerCase()} energy. ${
      veHouse === 7 ? 'Venus in the 7th is a strong indicator of a harmonious and loving partnership.' :
      veHouse === 2 ? 'Venus in the 2nd brings financial prosperity and a love of fine things.' :
      veHouse === 1 ? 'Venus in the 1st blesses you with charm, beauty, and a magnetic personality.' :
      `Matters of ${HOUSE_MEANINGS[veHouse]} are touched by Venusian grace and beauty.`
    }`,
  });

  // 5b. Deep Love Prediction
  predictions.push(generateLovePrediction(planets, lagnaSign_));

  // 5c. Career Prediction
  predictions.push(generateCareerPrediction(planets, lagnaSign_));

  // 6. Saturn reading (karma & discipline)
  const saSign = Math.floor(planets.Sa / 30);
  const saHouse = getHouse('Sa', planets, lagnaSign_);
  predictions.push({
    category: 'Karma & Discipline',
    icon: '⚖️',
    title: `Saturn in ${SIGN_TRAITS[saSign].name} (House ${saHouse})`,
    text: `Saturn, the karmic teacher, is in ${SIGN_TRAITS[saSign].name} in your ${saHouse}${ordinal(saHouse)} house. This is where life demands patience, discipline, and hard work. The lessons of ${HOUSE_MEANINGS[saHouse]} are central to your karmic journey. ${
      saHouse === 10 ? 'Saturn in the 10th can bring great career success through sustained effort and integrity.' :
      saHouse === 7 ? 'Relationships may require patience and maturity — partnerships deepen with time.' :
      saHouse === 1 ? 'A serious, disciplined personality that grows stronger with age.' :
      `Through perseverance in ${HOUSE_MEANINGS[saHouse]}, you build lasting foundations.`
    }`,
  });

  // 7. Nakshatra reading
  if (panchanga?.nakshatra) {
    predictions.push({
      category: 'Birth Star',
      icon: '✨',
      title: `Janma Nakṣatra: ${panchanga.nakshatra.name}`,
      text: `Your Moon's Nakshatra is ${panchanga.nakshatra.name} (${panchanga.nakshatra.num}/27), ruled by ${PLANET_NAMES[panchanga.nakshatra.lord] || panchanga.nakshatra.lord}. This lunar mansion deeply influences your instincts, habits, and subconscious patterns. The ${panchanga.nakshatra.lord} rulership colors your emotional responses and the way you process experiences on a soul level.`,
    });
  }

  return predictions;
}

function generateLovePrediction(planets, lagnaSign) {
  const veSign  = Math.floor(planets.Ve / 30);
  const veHouse = getHouse('Ve', planets, lagnaSign);
  const moSign  = Math.floor(planets.Mo / 30);
  const moHouse = getHouse('Mo', planets, lagnaSign);
  const maSign  = Math.floor(planets.Ma / 30);
  const maHouse = getHouse('Ma', planets, lagnaSign);
  const jpHouse = getHouse('Jp', planets, lagnaSign);
  const saHouse = getHouse('Sa', planets, lagnaSign);
  const h7Sign  = (lagnaSign + 6) % 12; // 7th house sign
  const veStrength = getPlanetStrength('Ve', veSign);

  const lines = [];

  // Love style from Venus sign
  const LOVE_STYLE = {
    0:  'passionate and direct — you fall fast and love boldly',
    1:  'sensual and devoted — you love deeply and value loyalty above all',
    2:  'playful and curious — you need mental connection and variety to stay engaged',
    3:  'nurturing and emotional — you love through care, home, and deep emotional bonds',
    4:  'romantic and generous — you love grandly and need admiration in return',
    5:  'thoughtful and selective — you show love through acts of service and attention to detail',
    6:  'harmonious and idealistic — you seek balance, beauty, and a true equal partner',
    7:  'intense and transformative — your love runs deep, magnetic, and all-consuming',
    8:  'adventurous and free-spirited — you need space, growth, and shared philosophy',
    9:  'committed and patient — you take love seriously and build lasting bonds slowly',
    10: 'unconventional and independent — you value friendship and intellectual equality in love',
    11: 'compassionate and spiritual — you love with empathy, often putting your partner first',
  };

  lines.push(`Your Venus in ${SIGN_TRAITS[veSign].name} makes you ${LOVE_STYLE[veSign]}.`);

  // Venus house influence
  const VE_HOUSE_LOVE = {
    1:  'Venus in the 1st house gives you natural charm and magnetism — people are drawn to you effortlessly.',
    2:  'Venus in the 2nd house ties love to family and security — you seek a partner who feels like home.',
    3:  'Venus in the 3rd house — communication and shared interests are the foundation of your romantic bonds.',
    4:  'Venus in the 4th house — you find love through comfort, home life, and emotional safety.',
    5:  'Venus in the 5th house is one of the strongest placements for romance — love is joyful, creative, and abundant.',
    6:  'Venus in the 6th house — love often develops through work or daily routines; you show affection through service.',
    7:  'Venus in the 7th house is the classic marriage indicator — a devoted, beautiful partnership is strongly indicated.',
    8:  'Venus in the 8th house — your love life is intense, transformative, and deeply karmic.',
    9:  'Venus in the 9th house — you may find love through travel, higher learning, or with someone from a different culture.',
    10: 'Venus in the 10th house — your partner may be connected to your career; public life and love intertwine.',
    11: 'Venus in the 11th house — love often blossoms from friendship; your social circle is key to meeting a partner.',
    12: 'Venus in the 12th house — love may be secretive, spiritual, or involve sacrifice; foreign connections are possible.',
  };
  lines.push(VE_HOUSE_LOVE[veHouse]);

  // 7th house lord strength
  const h7Lord = SIGN_TRAITS[h7Sign].lord;
  const h7LordHouse = getHouse(h7Lord, planets, lagnaSign);
  const h7LordSign = Math.floor(planets[h7Lord] / 30);
  const h7Strength = getPlanetStrength(h7Lord, h7LordSign);
  lines.push(
    `The 7th house of marriage is ${SIGN_TRAITS[h7Sign].name}, ruled by ${PLANET_NAMES[h7Lord]}. ` +
    `Your 7th lord is placed in the ${h7LordHouse}${ordinal(h7LordHouse)} house` +
    (h7Strength ? ` and is ${h7Strength}` : '') +
    `. ${
      h7LordHouse === 7 ? 'This is a strong placement — your 7th lord in its own house brings a stable, fulfilling partnership.' :
      h7LordHouse === 1 ? 'The 7th lord in the 1st house suggests your partner will be very similar to you in nature.' :
      h7LordHouse === 5 ? 'The 7th lord in the 5th house is a beautiful indicator of a love marriage.' :
      h7LordHouse === 11 ? 'The 7th lord in the 11th house suggests gains and fulfillment through marriage.' :
      h7LordHouse === 6 || h7LordHouse === 8 || h7LordHouse === 12 ? 'This placement calls for patience — relationships may require extra care and conscious effort.' :
      'Partnership will be an important theme of growth in your life.'
    }`
  );

  // Moon's role in emotional compatibility
  const MOON_COMPAT = {
    0:  'emotionally, you need a partner who matches your energy and gives you space to lead',
    1:  'you crave emotional stability and a partner who is consistent and grounded',
    2:  'you need a partner who stimulates your mind and keeps things interesting',
    3:  'you are deeply nurturing and need a partner who appreciates your emotional depth',
    4:  'you need warmth, appreciation, and a partner who makes you feel special',
    5:  'you need a partner who is reliable, clean-hearted, and appreciates your thoughtfulness',
    6:  'you seek harmony and fairness — conflict in relationships deeply unsettles you',
    7:  'you bond intensely and need a partner who can handle your emotional depth',
    8:  'you need freedom and a partner who shares your love of adventure and ideas',
    9:  'you are emotionally reserved but deeply loyal once committed',
    10: 'you need a partner who respects your independence and shares your ideals',
    11: 'you are empathetic and giving — be mindful of boundaries in relationships',
  };
  lines.push(`Your Moon in ${SIGN_TRAITS[moSign].name} reveals that ${MOON_COMPAT[moSign]}.`);

  // Mars (desire & passion)
  const MARS_PASSION = {
    0:  'fiery and impulsive — you pursue love with intensity and directness',
    1:  'steady and sensual — your desire is slow to ignite but burns long',
    2:  'flirtatious and witty — you attract through conversation and charm',
    3:  'protective and emotional — you express desire through care and devotion',
    4:  'dramatic and passionate — you love with flair and expect the same in return',
    5:  'reserved but precise — you express desire through thoughtful gestures',
    6:  'romantic and balanced — you pursue love with grace and diplomacy',
    7:  'magnetic and intense — your desire is powerful and transformative',
    8:  'adventurous and bold — you are attracted to freedom and excitement',
    9:  'disciplined and serious — you pursue love with long-term intentions',
    10: 'unconventional — you are attracted to unique, independent individuals',
    11: 'gentle and spiritual — your desire is compassionate and selfless',
  };
  lines.push(`Mars in ${SIGN_TRAITS[maSign].name} shows your passion is ${MARS_PASSION[maSign]}.`);

  // Jupiter's blessing on love
  if (jpHouse === 5 || jpHouse === 7 || jpHouse === 11) {
    lines.push(`Jupiter in the ${jpHouse}${ordinal(jpHouse)} house is a powerful blessing for your love life — expect growth, joy, and abundance in relationships.`);
  }

  // Saturn's influence
  if (saHouse === 7) {
    lines.push(`Saturn in the 7th house suggests marriage may come later in life, but when it does, it is built on a solid, lasting foundation.`);
  }

  // Overall love outlook
  const OUTLOOK = [
    'Your chart shows a warm and loving nature with strong potential for a fulfilling relationship.',
    'The planetary alignments suggest that love will be a significant and transformative force in your life.',
    'Your chart indicates deep capacity for love — patience and self-awareness will guide you to the right partner.',
    'The stars point to meaningful connections — trust the timing of your love story.',
  ];
  lines.push(OUTLOOK[(veSign + moSign) % OUTLOOK.length]);

  return {
    category: 'Love & Relationships',
    icon: '❤️',
    title: 'Love Prediction',
    text: lines.join(' '),
    bullets: lines,
  };
}

function generateCareerPrediction(planets, lagnaSign) {
  const suSign  = Math.floor(planets.Su / 30);
  const suHouse = getHouse('Su', planets, lagnaSign);
  const saSign  = Math.floor(planets.Sa / 30);
  const saHouse = getHouse('Sa', planets, lagnaSign);
  const maSign  = Math.floor(planets.Ma / 30);
  const maHouse = getHouse('Ma', planets, lagnaSign);
  const jpSign  = Math.floor(planets.Jp / 30);
  const jpHouse = getHouse('Jp', planets, lagnaSign);
  const meSign  = Math.floor(planets.Me / 30);
  const meHouse = getHouse('Me', planets, lagnaSign);
  const h10Sign = (lagnaSign + 9) % 12;
  const h10Lord = SIGN_TRAITS[h10Sign].lord;
  const h10LordHouse = getHouse(h10Lord, planets, lagnaSign);
  const h10LordSign  = Math.floor(planets[h10Lord] / 30);
  const h10Strength  = getPlanetStrength(h10Lord, h10LordSign);

  const lines = [];

  // 10th house — career domain
  const H10_DOMAIN = {
    0:  'leadership, entrepreneurship, sports, military, or pioneering ventures',
    1:  'finance, banking, agriculture, luxury goods, real estate, or arts',
    2:  'media, writing, communication, trade, education, or technology',
    3:  'hospitality, nursing, real estate, psychology, or food industry',
    4:  'politics, management, entertainment, government, or creative arts',
    5:  'medicine, accounting, analysis, research, editing, or health services',
    6:  'law, diplomacy, fashion, design, counseling, or public relations',
    7:  'research, investigation, occult sciences, surgery, insurance, or finance',
    8:  'teaching, philosophy, law, travel, publishing, or spiritual work',
    9:  'engineering, administration, government, architecture, or business',
    10: 'technology, science, social work, aviation, astrology, or innovation',
    11: 'spirituality, healing, foreign work, arts, charity, or research',
  };
  lines.push(`Your 10th house falls in ${SIGN_TRAITS[h10Sign].name}, pointing toward careers in ${H10_DOMAIN[h10Sign]}.`);

  // 10th lord placement
  lines.push(
    `The 10th lord ${PLANET_NAMES[h10Lord]} is placed in the ${h10LordHouse}${ordinal(h10LordHouse)} house` +
    (h10Strength ? ` and is ${h10Strength}` : '') +
    `. ${
      h10LordHouse === 10 ? 'This is an excellent placement — your 10th lord in its own house gives strong career focus and public recognition.' :
      h10LordHouse === 1  ? 'The 10th lord in the 1st house makes career central to your identity — you are driven to succeed.' :
      h10LordHouse === 9  ? 'The 10th lord in the 9th house blesses your career with fortune, wisdom, and possibly foreign opportunities.' :
      h10LordHouse === 11 ? 'The 10th lord in the 11th house is excellent for gains through career — financial success is strongly indicated.' :
      h10LordHouse === 5  ? 'The 10th lord in the 5th house favors creative fields, education, or work involving children and speculation.' :
      h10LordHouse === 6  ? 'The 10th lord in the 6th house suits service-oriented careers — medicine, law, or competitive fields.' :
      h10LordHouse === 7  ? 'The 10th lord in the 7th house favors business partnerships, consulting, or international trade.' :
      'Your career path will be shaped by the themes of the ' + h10LordHouse + ordinal(h10LordHouse) + ' house.'
    }`
  );

  // Sun — authority and recognition
  const SUN_CAREER = {
    0:  'You are a natural leader — roles with authority, independence, and visibility suit you best.',
    1:  'You thrive in stable, well-established organizations and value financial security in your work.',
    2:  'You excel in communication-heavy roles — writing, speaking, media, or business.',
    3:  'You are drawn to nurturing professions — healthcare, education, or community service.',
    4:  'You seek recognition and leadership — management, politics, or the arts are your calling.',
    5:  'You are detail-oriented and analytical — research, medicine, or technical fields suit you.',
    6:  'You work best in collaborative, harmonious environments — law, design, or diplomacy.',
    7:  'You are drawn to deep, transformative work — research, psychology, or finance.',
    8:  'You are a visionary — teaching, philosophy, travel, or entrepreneurship calls to you.',
    9:  'You are disciplined and ambitious — engineering, government, or corporate leadership.',
    10: 'You are innovative and unconventional — technology, science, or social reform.',
    11: 'You are compassionate and intuitive — healing, arts, or spiritual work fulfills you.',
  };
  lines.push(`Sun in ${SIGN_TRAITS[suSign].name} in the ${suHouse}${ordinal(suHouse)} house: ${SUN_CAREER[suSign]}`);

  // Saturn — work ethic and career longevity
  const SA_CAREER = {
    1:  'Saturn in the 1st house builds a disciplined, hardworking personality — success comes through persistence.',
    2:  'Saturn in the 2nd house demands financial discipline — wealth is built slowly but surely.',
    3:  'Saturn in the 3rd house rewards consistent effort in communication and skill-building.',
    4:  'Saturn in the 4th house may delay property gains but brings lasting stability in later life.',
    5:  'Saturn in the 5th house calls for patience in creative and speculative ventures.',
    6:  'Saturn in the 6th house is excellent for service careers — you overcome obstacles through hard work.',
    7:  'Saturn in the 7th house brings serious business partnerships and delayed but stable marriage.',
    8:  'Saturn in the 8th house favors research, occult, or long-term investment careers.',
    9:  'Saturn in the 9th house rewards those who pursue higher education and ethical careers.',
    10: 'Saturn in the 10th house is a powerful career placement — great success through sustained effort and integrity.',
    11: 'Saturn in the 11th house brings gains through disciplined networking and long-term goals.',
    12: 'Saturn in the 12th house favors work in isolation, foreign lands, or spiritual institutions.',
  };
  lines.push(SA_CAREER[saHouse]);

  // Mars — drive and ambition
  const MA_CAREER = {
    0:  'Mars in Aries gives fierce ambition and entrepreneurial drive.',
    1:  'Mars in Taurus brings steady, determined effort toward material goals.',
    2:  'Mars in Gemini excels in fast-paced, multi-tasking environments.',
    3:  'Mars in Cancer channels energy into protective, nurturing roles.',
    4:  'Mars in Leo drives you toward leadership and public recognition.',
    5:  'Mars in Virgo brings precision and excellence in technical or analytical work.',
    6:  'Mars in Libra works best in competitive but fair environments like law or business.',
    7:  'Mars in Scorpio gives intense focus — research, investigation, or surgery.',
    8:  'Mars in Sagittarius fuels ambition for travel, teaching, or entrepreneurship.',
    9:  'Mars in Capricorn is exalted — exceptional drive for career achievement and status.',
    10: 'Mars in Aquarius innovates and leads in technology or social causes.',
    11: 'Mars in Pisces channels energy into creative, spiritual, or healing work.',
  };
  lines.push(MA_CAREER[maSign]);

  // Jupiter — expansion and wisdom in career
  if (jpHouse === 10 || jpHouse === 1 || jpHouse === 9 || jpHouse === 11) {
    const JP_BLESS = {
      10: 'Jupiter in the 10th house is one of the finest career placements — recognition, growth, and abundance in your professional life are strongly indicated.',
      1:  'Jupiter in the 1st house blesses you with wisdom and optimism that opens career doors naturally.',
      9:  'Jupiter in the 9th house favors careers in education, law, spirituality, or international fields.',
      11: 'Jupiter in the 11th house brings significant financial gains and fulfillment of career ambitions.',
    };
    lines.push(JP_BLESS[jpHouse]);
  }

  // Mercury — intellect and communication in career
  const ME_CAREER = {
    1:  'Mercury in the 1st house makes you articulate and quick-thinking — communication is your career asset.',
    2:  'Mercury in the 2nd house favors finance, banking, or speech-related professions.',
    3:  'Mercury in the 3rd house excels in writing, media, sales, or technology.',
    6:  'Mercury in the 6th house suits analytical, medical, or service-oriented careers.',
    10: 'Mercury in the 10th house is excellent for careers in business, media, or public speaking.',
  };
  if (ME_CAREER[meHouse]) lines.push(ME_CAREER[meHouse]);

  // Overall career outlook
  const OUTLOOK = [
    'Your chart shows strong potential for professional success — stay consistent and trust the process.',
    'The planetary alignments indicate a career path that grows stronger with time and experience.',
    'Your chart points to a fulfilling career when you align your work with your natural strengths.',
    'The stars indicate that your greatest career achievements come through perseverance and authenticity.',
  ];
  lines.push(OUTLOOK[(suSign + saSign) % OUTLOOK.length]);

  return {
    category: 'Career & Success',
    icon: '🚀',
    title: 'Career Prediction',
    text: lines.join(' '),
    bullets: lines,
  };
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
