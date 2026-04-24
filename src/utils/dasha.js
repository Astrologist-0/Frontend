// Vimshottari Dasha System
// Total cycle = 120 years

const DASHA_YEARS = { Ke:7, Ve:20, Su:6, Mo:10, Ma:7, Ra:18, Jp:16, Sa:19, Me:17 };
const DASHA_ORDER = ['Ke','Ve','Su','Mo','Ma','Ra','Jp','Sa','Me'];
const NAKSHATRA_LORDS = ['Ke','Ve','Su','Mo','Ma','Ra','Jp','Sa','Me','Ke','Ve','Su','Mo','Ma','Ra','Jp','Sa','Me','Ke','Ve','Su','Mo','Ma','Ra','Jp','Sa','Me'];
const PLANET_FULL = { Ke:'Ketu', Ve:'Venus', Su:'Sun', Mo:'Moon', Ma:'Mars', Ra:'Rahu', Jp:'Jupiter', Sa:'Saturn', Me:'Mercury' };

const TOTAL_YEARS = 120;
const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;

function dashaStartFromMoon(moonLon, birthDate) {
  const nakIdx  = Math.floor(moonLon / (360 / 27));
  const nakLord = NAKSHATRA_LORDS[nakIdx];
  const segSize = 360 / 27;
  const elapsed = (moonLon % segSize) / segSize; // fraction elapsed in current nakshatra
  const lordYears = DASHA_YEARS[nakLord];
  const remainingYears = lordYears * (1 - elapsed);

  // Start of current dasha (before birth)
  const currentDashaStart = new Date(birthDate.getTime() - elapsed * lordYears * MS_PER_YEAR);

  return { nakLord, remainingYears, currentDashaStart };
}

export function calcVimshottariDasha(moonLon, birthDate, yearsAhead = 100) {
  const { nakLord, remainingYears, currentDashaStart } = dashaStartFromMoon(moonLon, birthDate);

  const dashas = [];
  let lordIdx = DASHA_ORDER.indexOf(nakLord);
  let cursor  = new Date(currentDashaStart);

  // Build dasha sequence
  while (cursor < new Date(birthDate.getTime() + yearsAhead * MS_PER_YEAR)) {
    const lord    = DASHA_ORDER[lordIdx % 9];
    const years   = DASHA_YEARS[lord];
    const start   = new Date(cursor);
    const end     = new Date(cursor.getTime() + years * MS_PER_YEAR);

    // Build antardashas (sub-periods)
    const antardashas = [];
    let adCursor = new Date(start);
    for (let i = 0; i < 9; i++) {
      const adLord  = DASHA_ORDER[(lordIdx + i) % 9];
      const adYears = (years * DASHA_YEARS[adLord]) / TOTAL_YEARS;
      const adStart = new Date(adCursor);
      const adEnd   = new Date(adCursor.getTime() + adYears * MS_PER_YEAR);
      antardashas.push({ lord: adLord, name: PLANET_FULL[adLord], start: adStart, end: adEnd, years: adYears });
      adCursor = adEnd;
    }

    dashas.push({ lord, name: PLANET_FULL[lord], start, end, years, antardashas });
    cursor = end;
    lordIdx++;
  }

  return dashas;
}

export function getCurrentDasha(dashas, date = new Date()) {
  const maha = dashas.find(d => date >= d.start && date < d.end);
  if (!maha) return null;
  const antar = maha.antardashas.find(a => date >= a.start && date < a.end);
  return { maha, antar };
}

export function formatDashaDate(date) {
  return date.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
}

export { PLANET_FULL, DASHA_YEARS };
