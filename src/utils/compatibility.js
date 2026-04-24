// Kundli Matching / Synastry Engine
import { RASHI_NAMES, NAKSHATRA_NAMES } from './astro';

const NAKSHATRA_GANA = [
  'Deva','Manushya','Rakshasa','Manushya','Deva','Manushya','Deva','Rakshasa','Rakshasa',
  'Rakshasa','Manushya','Manushya','Deva','Rakshasa','Deva','Rakshasa','Rakshasa','Rakshasa',
  'Rakshasa','Manushya','Manushya','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva'
];

const NAKSHATRA_NADI = [
  'Adi','Madhya','Antya','Madhya','Adi','Madhya','Antya','Madhya','Adi',
  'Madhya','Antya','Madhya','Adi','Madhya','Antya','Madhya','Adi','Madhya',
  'Antya','Madhya','Adi','Madhya','Antya','Madhya','Adi','Madhya','Antya'
];

function getNakshatra(lon) { return Math.floor(lon / (360 / 27)); }
function getRashi(lon) { return Math.floor(lon / 30); }

export function calculateCompatibility(chart1, chart2) {
  const nak1 = getNakshatra(chart1.planets.Mo);
  const nak2 = getNakshatra(chart2.planets.Mo);
  const moon1Sign = getRashi(chart1.planets.Mo);
  const moon2Sign = getRashi(chart2.planets.Mo);

  let score = 0;
  const factors = [];

  // 1. Varna (1 point) — spiritual compatibility
  const varna1 = Math.floor(nak1 / 7);
  const varna2 = Math.floor(nak2 / 7);
  if (varna1 >= varna2) { score += 1; factors.push({ name: 'Varna', points: 1, max: 1, desc: 'Spiritual compatibility is good' }); }
  else factors.push({ name: 'Varna', points: 0, max: 1, desc: 'Spiritual levels differ — mutual respect needed' });

  // 2. Vashya (2 points) — mutual attraction
  const vashyaScore = (moon1Sign === moon2Sign || Math.abs(moon1Sign - moon2Sign) === 6) ? 2 : 0;
  score += vashyaScore;
  factors.push({ name: 'Vashya', points: vashyaScore, max: 2, desc: vashyaScore === 2 ? 'Strong mutual attraction' : 'Moderate attraction' });

  // 3. Tara (3 points) — destiny compatibility
  const taraDist = Math.abs(nak1 - nak2) % 9;
  const taraScore = [3,0,3,1,0,2,1,0,3][taraDist] || 0;
  score += taraScore;
  factors.push({ name: 'Tara', points: taraScore, max: 3, desc: taraScore >= 2 ? 'Destinies align well' : 'Some karmic friction' });

  // 4. Yoni (4 points) — physical/sexual compatibility
  const yoniScore = nak1 === nak2 ? 4 : Math.abs(nak1 - nak2) <= 3 ? 2 : 1;
  score += yoniScore;
  factors.push({ name: 'Yoni', points: yoniScore, max: 4, desc: yoniScore >= 3 ? 'Excellent physical chemistry' : yoniScore === 2 ? 'Good physical compatibility' : 'Physical compatibility needs work' });

  // 5. Graha Maitri (5 points) — mental compatibility
  const lordDist = Math.abs(moon1Sign - moon2Sign);
  const maitriScore = lordDist === 0 ? 5 : lordDist <= 2 ? 4 : lordDist <= 4 ? 3 : lordDist <= 6 ? 2 : 1;
  score += maitriScore;
  factors.push({ name: 'Graha Maitri', points: maitriScore, max: 5, desc: maitriScore >= 4 ? 'Minds are in harmony' : maitriScore >= 3 ? 'Good mental rapport' : 'Communication requires effort' });

  // 6. Gana (6 points) — temperament
  const gana1 = NAKSHATRA_GANA[nak1];
  const gana2 = NAKSHATRA_GANA[nak2];
  let ganaScore = 0;
  if (gana1 === gana2) ganaScore = 6;
  else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) ganaScore = 5;
  else if (gana1 === 'Manushya' && gana2 === 'Manushya') ganaScore = 6;
  else ganaScore = 1;
  score += ganaScore;
  factors.push({ name: 'Gana', points: ganaScore, max: 6, desc: ganaScore >= 5 ? `${gana1}-${gana2} temperaments blend well` : 'Temperament differences need understanding' });

  // 7. Bhakoot (7 points) — emotional compatibility
  const signDist = (moon2Sign - moon1Sign + 12) % 12;
  const bhakootScore = [0,6,7,0,5,5,7,0,5,0,0,0][signDist] || 0;
  score += bhakootScore;
  factors.push({ name: 'Bhakoot', points: bhakootScore, max: 7, desc: bhakootScore >= 5 ? 'Emotional harmony is strong' : bhakootScore >= 3 ? 'Moderate emotional compatibility' : 'Emotional challenges — patience needed' });

  // 8. Nadi (8 points) — health/progeny
  const nadi1 = NAKSHATRA_NADI[nak1];
  const nadi2 = NAKSHATRA_NADI[nak2];
  const nadiScore = nadi1 !== nadi2 ? 8 : 0;
  score += nadiScore;
  factors.push({ name: 'Nadi', points: nadiScore, max: 8, desc: nadiScore === 8 ? 'Excellent for health and children' : 'Nadi dosha present — consult astrologer for remedies' });

  const total = 36;
  const percentage = Math.round((score / total) * 100);

  let verdict = '';
  if (percentage >= 70) verdict = 'Excellent match — highly compatible';
  else if (percentage >= 50) verdict = 'Good match — compatible with minor adjustments';
  else if (percentage >= 30) verdict = 'Average match — requires effort and understanding';
  else verdict = 'Challenging match — significant differences to work through';

  return { score, total, percentage, verdict, factors };
}

export function generateCompatibilityReport(chart1, chart2, name1 = 'Person 1', name2 = 'Person 2') {
  const result = calculateCompatibility(chart1, chart2);
  const nak1 = getNakshatra(chart1.planets.Mo);
  const nak2 = getNakshatra(chart2.planets.Mo);

  return {
    ...result,
    summary: `${name1} (${NAKSHATRA_NAMES[nak1]}) and ${name2} (${NAKSHATRA_NAMES[nak2]}) score ${result.score}/${result.total} (${result.percentage}%). ${result.verdict}.`,
    person1: { name: name1, nakshatra: NAKSHATRA_NAMES[nak1], moonSign: RASHI_NAMES[getRashi(chart1.planets.Mo)] },
    person2: { name: name2, nakshatra: NAKSHATRA_NAMES[nak2], moonSign: RASHI_NAMES[getRashi(chart2.planets.Mo)] },
  };
}
