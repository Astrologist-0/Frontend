// Transit-based forecast engine
import { calcChart, RASHIS, RASHI_NAMES, NAKSHATRA_NAMES } from './astro';

const PLANET_NAMES = { Su:'Sun', Mo:'Moon', Ma:'Mars', Me:'Mercury', Jp:'Jupiter', Ve:'Venus', Sa:'Saturn', Ra:'Rahu', Ke:'Ketu' };

const HOUSE_THEMES = {
  1:'self, health, and new beginnings',
  2:'finances, family, and speech',
  3:'communication, courage, and short travel',
  4:'home, emotions, and inner peace',
  5:'creativity, romance, and children',
  6:'health, work, and overcoming obstacles',
  7:'relationships, partnerships, and contracts',
  8:'transformation, secrets, and shared resources',
  9:'wisdom, travel, and spiritual growth',
  10:'career, reputation, and public life',
  11:'gains, social life, and aspirations',
  12:'rest, spirituality, and letting go',
};

const TRANSIT_EFFECTS = {
  Su: { positive:'confidence, vitality, and recognition', challenging:'ego conflicts and health issues' },
  Mo: { positive:'emotional clarity and intuition', challenging:'mood swings and emotional sensitivity' },
  Ma: { positive:'energy, drive, and courage', challenging:'conflicts, accidents, and impatience' },
  Me: { positive:'clear thinking, communication, and deals', challenging:'miscommunication and mental stress' },
  Jp: { positive:'expansion, wisdom, and good fortune', challenging:'overindulgence and false optimism' },
  Ve: { positive:'love, beauty, and financial gains', challenging:'relationship issues and overspending' },
  Sa: { positive:'discipline, structure, and long-term gains', challenging:'delays, restrictions, and hard lessons' },
  Ra: { positive:'ambition, innovation, and breakthroughs', challenging:'confusion, obsession, and illusions' },
  Ke: { positive:'spiritual insight and detachment', challenging:'losses, isolation, and past karma' },
};

function getTransitHouse(transitLon, natalLagnaSign) {
  const transitSign = Math.floor(transitLon / 30);
  return ((transitSign - natalLagnaSign + 12) % 12) + 1;
}

function getAspectedHouses(planet, house) {
  // Vedic aspects
  const aspects = { Ma:[4,8], Jp:[5,9], Sa:[3,10], Ra:[5,9], Ke:[5,9] };
  const base = [house];
  const extra = (aspects[planet] || []).map(a => ((house + a - 2) % 12) + 1);
  return [...new Set([...base, ...extra])];
}

export function generateForecasts(natalChart, period = 'daily') {
  const now = new Date();
  let forecastDate;

  if (period === 'daily') {
    forecastDate = now;
  } else if (period === 'weekly') {
    forecastDate = new Date(now.getTime() + 3.5 * 86400000); // midpoint of week
  } else {
    forecastDate = new Date(now.getTime() + 15 * 86400000); // midpoint of month
  }

  const transitChart = calcChart(forecastDate, natalChart.meta?.lat || 0, natalChart.meta?.lon || 0);
  const lagnaSign = natalChart.lagnaSign;

  const forecasts = [];

  // Overall energy
  const moonHouse = getTransitHouse(transitChart.planets.Mo, lagnaSign);
  const sunHouse  = getTransitHouse(transitChart.planets.Su, lagnaSign);
  const moonSign  = Math.floor(transitChart.planets.Mo / 30);

  forecasts.push({
    planet: 'Overall',
    icon: '🌟',
    title: `${period === 'daily' ? 'Today\'s' : period === 'weekly' ? 'This Week\'s' : 'This Month\'s'} Energy`,
    text: `The Moon transits ${RASHI_NAMES[moonSign]} in your ${moonHouse}${ord(moonHouse)} house, bringing focus to ${HOUSE_THEMES[moonHouse]}. The Sun illuminates your ${sunHouse}${ord(sunHouse)} house of ${HOUSE_THEMES[sunHouse]}.`,
    color: '#a78bfa',
  });

  // Key planet transits
  const keyPlanets = period === 'daily'
    ? ['Mo', 'Su', 'Me', 'Ve', 'Ma']
    : ['Su', 'Ma', 'Me', 'Ve', 'Jp', 'Sa'];

  for (const p of keyPlanets) {
    const tLon   = transitChart.planets[p];
    const tSign  = Math.floor(tLon / 30);
    const tHouse = getTransitHouse(tLon, lagnaSign);
    const nSign  = Math.floor(natalChart.planets[p] / 30);
    const isSameSign = tSign === nSign;

    const effect = TRANSIT_EFFECTS[p];
    const isPositive = [1,4,5,7,9,10,11].includes(tHouse);

    forecasts.push({
      planet: p,
      icon: getPlanetIcon(p),
      title: `${PLANET_NAMES[p]} in ${RASHI_NAMES[tSign]} (House ${tHouse})`,
      text: `${PLANET_NAMES[p]} transits your ${tHouse}${ord(tHouse)} house of ${HOUSE_THEMES[tHouse]}. ${isPositive ? `This favors ${effect.positive}.` : `Watch for ${effect.challenging}.`}${isSameSign ? ` ${PLANET_NAMES[p]} returns to its natal position — a significant personal cycle.` : ''}`,
      color: getPlanetColor(p),
      positive: isPositive,
    });
  }

  // Special alerts
  const saHouse = getTransitHouse(transitChart.planets.Sa, lagnaSign);
  if ([1,4,8,12].includes(saHouse)) {
    forecasts.push({
      planet: 'Sa',
      icon: '⚠️',
      title: `Saturn in House ${saHouse} — Sāde Sātī / Kaṇṭaka`,
      text: `Saturn transits your ${saHouse}${ord(saHouse)} house. This is a period calling for patience, discipline, and karmic work. Avoid shortcuts and focus on long-term foundations.`,
      color: '#94a3b8',
      positive: false,
      alert: true,
    });
  }

  const jpHouse = getTransitHouse(transitChart.planets.Jp, lagnaSign);
  if ([1,5,9,11].includes(jpHouse)) {
    forecasts.push({
      planet: 'Jp',
      icon: '✨',
      title: `Jupiter's Blessing — House ${jpHouse}`,
      text: `Jupiter transits your ${jpHouse}${ord(jpHouse)} house of ${HOUSE_THEMES[jpHouse]}. This is an auspicious period for expansion, wisdom, and good fortune in these areas.`,
      color: '#fbbf24',
      positive: true,
      highlight: true,
    });
  }

  return { forecasts, transitChart, period, date: forecastDate };
}

function getPlanetIcon(p) {
  return { Su:'☀️', Mo:'🌙', Ma:'♂️', Me:'☿', Jp:'🪐', Ve:'💫', Sa:'⚖️', Ra:'🌑', Ke:'🔥' }[p] || '⭐';
}

function getPlanetColor(p) {
  return { Su:'#f59e0b', Mo:'#60a5fa', Ma:'#f87171', Me:'#34d399', Jp:'#fbbf24', Ve:'#f472b6', Sa:'#94a3b8', Ra:'#a78bfa', Ke:'#fb923c' }[p] || '#a78bfa';
}

function ord(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return s[(v-20)%10] || s[v] || s[0];
}

export { PLANET_NAMES, HOUSE_THEMES };
