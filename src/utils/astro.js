// Vedic Astrology Calculation Engine
// Uses astronomy-engine for planetary positions with corrected formulas:
//   - Lahiri ayanamsa: correct base epoch (J2000 = 23.8531°) and T in Julian centuries from J2000
//   - Ascendant: proper Meeus formula with MC-based quadrant correction
//   - Rahu: mean node formula with correct T
//   - Obliquity: quadratic formula for better accuracy over historical dates

import * as Astronomy from "astronomy-engine";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function norm(deg) { return ((deg % 360) + 360) % 360; }

// T in Julian centuries from J2000.0
// AstroTime.tt is days from J2000.0, so T = tt / 36525
function julianCenturies(time) {
  return time.tt / 36525;
}

// Lahiri (Chitrapaksha) ayanamsa
// Base: 23°51'11.4" = 23.8531° at J2000.0
// Rate: 50.2388475"/year = 1.39552°/century
// Quadratic term for better accuracy over historical dates
export function getLahiriAyanamsa(date) {
  const time = new Astronomy.AstroTime(date);
  const T = julianCenturies(time);
  return 23.8531 + 1.39552 * T + 0.000139 * T * T;
}

export function getRashi(lon)     { return Math.floor(lon / 30); }
export function getDegInSign(lon) { return lon % 30; }
export function getNakshatra(lon) { return Math.floor(lon / (360 / 27)); }

export const RASHIS        = ["Ar","Ta","Ge","Cn","Le","Vi","Li","Sc","Sg","Cp","Aq","Pi"];
export const RASHI_NAMES   = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const NAKSHATRA_NAMES = ["Asvini","Bharani","Krittika","Rohini","Mrigasira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
export const NAKSHATRA_LORDS = ["Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me"];
export const PLANET_NAMES  = { Su:"Surya", Mo:"Chandra", Ma:"Mangala", Me:"Budha", Jp:"Guru", Ve:"Shukra", Sa:"Shani", Ra:"Rahu", Ke:"Ketu", As:"Lagna" };
export const KARAKAS       = { Su:"DK", Mo:"BK", Ma:"PK", Me:"GK", Jp:"AmK", Ve:"AK", Sa:"PiK", Ra:"MK" };

// Tropical ecliptic longitude for a planet
function tropicalLon(body, time) {
  if (body === 'Sun')  return Astronomy.SunPosition(time).elon;
  if (body === 'Moon') return Astronomy.EclipticGeoMoon(time).lon;
  const obs = new Astronomy.Observer(0, 0, 0);
  const eq  = Astronomy.Equator(body, time, obs, true, false);
  return Astronomy.Ecliptic(eq.vec).elon;
}

// Mean lunar node (Rahu) tropical longitude
// Uses correct T = time.tt / 36525 (days from J2000 / days per century)
function rahuTropical(time) {
  const T = julianCenturies(time);
  return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

// Ecliptic obliquity (Meeus quadratic, T in Julian centuries from J2000)
function obliquity(T) {
  return 23.439291 - 0.013004 * T - 0.000164 * T * T;
}

// Lagna (Ascendant) tropical longitude
// Uses the Meeus formula (Astronomical Algorithms, Ch. 14) with MC-based quadrant correction
function calcLagnaLon(date, lat, lng) {
  const time  = new Astronomy.AstroTime(date);
  const T     = julianCenturies(time);
  const gast  = Astronomy.SiderealTime(time);          // hours
  const ramc  = norm((gast + lng / 15) * 15);          // RAMC in degrees
  const obl   = obliquity(T);
  const oblR  = obl * DEG;
  const ramcR = ramc * DEG;
  const latR  = lat * DEG;

  // Midheaven (MC) — same semicircle as RAMC
  let mc = norm(Math.atan2(Math.tan(ramcR), Math.cos(oblR)) * RAD);
  if (Math.abs(mc - ramc) > 90) mc = norm(mc + 180);

  // Ascendant — Meeus formula, then ensure it's ahead of MC
  // tan(Asc) = -cos(RAMC) / (sin(obl)·tan(lat) + cos(obl)·sin(RAMC))
  let asc = norm(Math.atan2(-Math.cos(ramcR), Math.sin(oblR) * Math.tan(latR) + Math.cos(oblR) * Math.sin(ramcR)) * RAD);
  if (asc < mc) asc = norm(asc + 180);

  return asc;
}

// ── Navamsa (D9) calculation ───────────────────────────────────────────────────
// Each sign is divided into 9 navamsas of 3°20' (200') each.
// The starting sign of the navamsa sequence depends on the natal sign's triplicity:
//   Fire signs  (Ar, Le, Sg) → start from Aries  (0)
//   Earth signs (Ta, Vi, Cp) → start from Capricorn (9)
//   Air signs   (Ge, Li, Aq) → start from Libra  (6)
//   Water signs (Cn, Sc, Pi) → start from Cancer (3)
const NAVAMSA_START = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3]; // indexed by rashi 0-11

export function getNavamsaSign(siderealLon) {
  const rashi    = Math.floor(siderealLon / 30);          // natal sign 0-11
  const degInSign = siderealLon % 30;                     // 0-30
  const pada     = Math.floor(degInSign / (30 / 9));      // navamsa pada 0-8
  return (NAVAMSA_START[rashi] + pada) % 12;
}

// Build navamsa planet map: same structure as planets but with D9 sign positions
export function calcNavamsa(planets) {
  const nav = {};
  for (const [p, lon] of Object.entries(planets)) {
    // Give navamsa sign a representative longitude (start of that sign)
    nav[p] = getNavamsaSign(lon) * 30 + (lon % (30 / 9)) * 9; // scaled deg within navamsa sign
  }
  return nav;
}

export function calcChart(date, lat, lng) {
  const time = new Astronomy.AstroTime(date);
  const ayan = getLahiriAyanamsa(date);

  // Tropical longitudes
  const trop = {
    As: calcLagnaLon(date, lat, lng),
    Su: tropicalLon("Sun",     time),
    Mo: tropicalLon("Moon",    time),
    Ma: tropicalLon("Mars",    time),
    Me: tropicalLon("Mercury", time),
    Jp: tropicalLon("Jupiter", time),
    Ve: tropicalLon("Venus",   time),
    Sa: tropicalLon("Saturn",  time),
    Ra: rahuTropical(time),
  };

  // Convert to sidereal (Vedic) by subtracting Lahiri ayanamsa
  const planets = {};
  for (const [k, v] of Object.entries(trop)) planets[k] = norm(v - ayan);
  planets.Ke = norm(planets.Ra + 180);

  // Whole-sign houses from Lagna
  const lagnaSign = getRashi(planets.As);
  const housePlanets = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];
  for (const [p, l] of Object.entries(planets)) {
    const house = ((getRashi(l) - lagnaSign + 12) % 12) + 1;
    housePlanets[house].push({ planet: p, lon: l, deg: getDegInSign(l) });
  }

  const panchanga = {
    tithi:     calcTithi(planets.Mo, planets.Su),
    nakshatra: calcNakshatra(planets.Mo),
    vara:      calcVara(time.ut),
    yoga:      calcYoga(planets.Su, planets.Mo),
    karana:    calcKarana(planets.Mo, planets.Su),
  };

  // Navamsa (D9) positions
  const navamsaPlanets = {};
  for (const [p, lon] of Object.entries(planets)) {
    navamsaPlanets[p] = getNavamsaSign(lon) * 30 + (lon % (30 / 9)) * 9;
  }
  const navamsaLagnaSign = getNavamsaSign(planets.As);

  return {
    jd: time.tt,
    ayanamsa: ayan,
    planets,
    housePlanets,
    lagnaSign,
    navamsaPlanets,
    navamsaLagnaSign,
    panchanga,
    grahaInfo: buildGrahaInfo(planets, lagnaSign),
    RASHIS, RASHI_NAMES, NAKSHATRA_NAMES, NAKSHATRA_LORDS, PLANET_NAMES, KARAKAS,
  };
}

// ── Panchanga helpers ──────────────────────────────────────────────────────────

function calcTithi(mo, su) {
  const diff = norm(mo - su);
  const t    = Math.floor(diff / 12) + 1;
  const pct  = ((diff % 12) / 12) * 100;
  const paksha = t <= 15 ? 'S' : 'K';
  const num    = t <= 15 ? t : t - 15;
  const lords  = ['Su','Mo','Ma','Me','Jp','Ve','Sa','Su','Mo','Ma','Me','Jp','Ve','Sa','Su'];
  return { num: t, paksha, display: paksha + num, lord: lords[(t - 1) % 15], pctLeft: (100 - pct).toFixed(1) };
}

function calcNakshatra(mo) {
  const seg = 360 / 27;
  const idx = Math.floor(mo / seg);
  const pct = ((mo % seg) / seg) * 100;
  return { name: NAKSHATRA_NAMES[idx], num: idx + 1, lord: NAKSHATRA_LORDS[idx], pctLeft: (100 - pct).toFixed(1) };
}

function calcVara(ut) {
  // ut is days from J2000 (UT); JD = ut + 2451545.0
  // Day of week: JD 0 = Monday (Julian day 0 = Jan 1, 4713 BC = Monday)
  const jd  = ut + 2451545.0;
  const day = ((Math.floor(jd + 1.5)) % 7 + 7) % 7; // 0=Sun,1=Mon,...,6=Sat
  const v = [
    { name:"Sunday",    short:"Su", lord:"Su" },
    { name:"Monday",    short:"Mo", lord:"Mo" },
    { name:"Tuesday",   short:"Ma", lord:"Ma" },
    { name:"Wednesday", short:"Me", lord:"Me" },
    { name:"Thursday",  short:"Jp", lord:"Jp" },
    { name:"Friday",    short:"Ve", lord:"Ve" },
    { name:"Saturday",  short:"Sa", lord:"Sa" },
  ];
  return v[day];
}

function calcYoga(su, mo) {
  const sum  = norm(su + mo);
  const idx  = Math.floor(sum / (360 / 27));
  const names = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarman","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
  const lords = ["Sa","Ve","Jp","Ve","Me","Ma","Sa","Me","Ma","Ra","Jp","Sa","Ma","Me","Ve","Ma","Ra","Me","Sa","Ve","Me","Ve","Jp","Me","Jp","Jp","Sa"];
  const pct  = ((sum % (360 / 27)) / (360 / 27)) * 100;
  return { name: names[idx], lord: lords[idx], pctLeft: (100 - pct).toFixed(1) };
}

function calcKarana(mo, su) {
  const diff = norm(mo - su);
  const idx  = Math.floor(diff / 6);
  const k    = ["Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti","Bava","Balava","Kaulava","Taitila"];
  return { name: k[idx % 11], pctLeft: (((diff % 6) / 6) * 100).toFixed(1) };
}

// ── Graha info table ───────────────────────────────────────────────────────────

function buildGrahaInfo(planets, lagnaSign) {
  const order     = ["As","Su","Mo","Ma","Me","Jp","Ve","Sa","Ra","Ke"];
  const fullNames = { As:"Lagna", Su:"Surya", Mo:"Chandra", Ma:"Mangala", Me:"Budha", Jp:"Guru", Ve:"Shukra", Sa:"Shani", Ra:"Rahu", Ke:"Ketu" };
  const karakas   = { Su:"DK", Mo:"BK", Ma:"PK", Me:"GK", Jp:"AmK", Ve:"AK", Sa:"PiK", Ra:"MK" };
  return order.map(p => {
    const l    = planets[p];
    const sign = getRashi(l);
    const house = ((sign - lagnaSign + 12) % 12) + 1;
    const nak  = getNakshatra(l);
    const deg  = getDegInSign(l);
    const d    = Math.floor(deg);
    const m    = Math.floor((deg - d) * 60);
    const s    = Math.floor(((deg - d) * 60 - m) * 60);
    return {
      id: p, name: fullNames[p], karaka: karakas[p] || "",
      sign: RASHIS[sign], signName: RASHI_NAMES[sign],
      lon: RASHIS[sign] + " " + d + "°" + m + "'" + s + "\"",
      nakshatra: NAKSHATRA_NAMES[nak] + " (" + (nak + 1) + ")",
      nakLord: NAKSHATRA_LORDS[nak], house,
    };
  });
}
