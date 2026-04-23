// Vedic Astrology Calculation Engine
import * as Astronomy from "astronomy-engine";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function norm(deg) { return ((deg % 360) + 360) % 360; }

export function getLahiriAyanamsa(date) {
  const jd = new Astronomy.AstroTime(date).tt;
  const T = (jd - 2451545.0) / 36525;
  return 23.85291667 - (50.2388475 / 3600) * T + (0.0002 / 3600) * T * T;
}

export function getRashi(lon)     { return Math.floor(lon / 30); }
export function getDegInSign(lon) { return lon % 30; }
export function getNakshatra(lon) { return Math.floor(lon / (360 / 27)); }

export const RASHIS = ["Ar","Ta","Ge","Cn","Le","Vi","Li","Sc","Sg","Cp","Aq","Pi"];
export const RASHI_NAMES = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export const NAKSHATRA_NAMES = ["Asvini","Bharani","Krittika","Rohini","Mrigasira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
export const NAKSHATRA_LORDS = ["Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Jp","Sa","Me"];
export const PLANET_NAMES = { Su:"Surya", Mo:"Chandra", Ma:"Mangala", Me:"Budha", Jp:"Guru", Ve:"Shukra", Sa:"Shani", Ra:"Rahu", Ke:"Ketu", As:"Lagna" };
export const KARAKAS = { Su:"DK", Mo:"BK", Ma:"PK", Me:"GK", Jp:"AmK", Ve:"AK", Sa:"PiK", Ra:"MK" };

function tropicalLon(body, time) {
  if (body === 'Sun') return Astronomy.SunPosition(time).elon;
  if (body === 'Moon') return Astronomy.EclipticGeoMoon(time).lon;
  const obs = new Astronomy.Observer(0, 0, 0);
  const eq = Astronomy.Equator(body, time, obs, true, false);
  return Astronomy.Ecliptic(eq.vec).elon;
}

function rahuTropical(time) {
  const T = (time.tt - 2451545.0) / 36525;
  return norm(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

function calcLagnaLon(date, lat, lng) {
  const time = new Astronomy.AstroTime(date);
  const gast = Astronomy.SiderealTime(time);
  const lstDeg = norm((gast + lng / 15) * 15);
  const obl = (23.4393 - 0.0000004 * (time.tt - 2451545.0) / 365.25) * DEG;
  const latR = lat * DEG;
  const lstR = lstDeg * DEG;
  const asc = Math.atan2(Math.cos(lstR), -(Math.sin(lstR) * Math.cos(obl) + Math.tan(latR) * Math.sin(obl)));
  return norm(asc * RAD);
}

export function calcChart(date, lat, lng) {
  const time = new Astronomy.AstroTime(date);
  const ayan = getLahiriAyanamsa(date);
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
  const planets = {};
  for (const [k, v] of Object.entries(trop)) planets[k] = norm(v - ayan);
  planets.Ke = norm(planets.Ra + 180);
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
  return { jd: time.tt, ayanamsa: ayan, planets, housePlanets, lagnaSign, panchanga, grahaInfo: buildGrahaInfo(planets, lagnaSign), RASHIS, RASHI_NAMES, NAKSHATRA_NAMES, NAKSHATRA_LORDS, PLANET_NAMES, KARAKAS };
}

function calcTithi(mo, su) {
  const diff = norm(mo - su);
  const t = Math.floor(diff / 12) + 1;
  const pct = ((diff % 12) / 12) * 100;
  const paksha = t <= 15 ? 'S' : 'K';
  const num = t <= 15 ? t : t - 15;
  const lords = ['Su','Mo','Ma','Me','Jp','Ve','Sa','Su','Mo','Ma','Me','Jp','Ve','Sa','Su'];
  return { num: t, paksha, display: paksha + num, lord: lords[(t - 1) % 15], pctLeft: (100 - pct).toFixed(1) };
}

function calcNakshatra(mo) {
  const seg = 360 / 27;
  const idx = Math.floor(mo / seg);
  const pct = ((mo % seg) / seg) * 100;
  return { name: NAKSHATRA_NAMES[idx], num: idx + 1, lord: NAKSHATRA_LORDS[idx], pctLeft: (100 - pct).toFixed(1) };
}

function calcVara(ut) {
  const day = Math.floor(ut + 2440588.5 + 0.5) % 7;
  const v = [
    { name:"Monday",    short:"Mo", lord:"Mo" },
    { name:"Tuesday",   short:"Ma", lord:"Ma" },
    { name:"Wednesday", short:"Me", lord:"Me" },
    { name:"Thursday",  short:"Jp", lord:"Jp" },
    { name:"Friday",    short:"Ve", lord:"Ve" },
    { name:"Saturday",  short:"Sa", lord:"Sa" },
    { name:"Sunday",    short:"Su", lord:"Su" },
  ];
  return v[day];
}

function calcYoga(su, mo) {
  const sum = norm(su + mo);
  const idx = Math.floor(sum / (360 / 27));
  const names = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarman","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
  const lords = ["Sa","Ve","Jp","Ve","Me","Ma","Sa","Me","Ma","Ra","Jp","Sa","Ma","Me","Ve","Ma","Ra","Me","Sa","Ve","Me","Ve","Jp","Me","Jp","Jp","Sa"];
  const pct = ((sum % (360 / 27)) / (360 / 27)) * 100;
  return { name: names[idx], lord: lords[idx], pctLeft: (100 - pct).toFixed(1) };
}

function calcKarana(mo, su) {
  const diff = norm(mo - su);
  const idx = Math.floor(diff / 6);
  const k = ["Bava","Balava","Kaulava","Taitila","Gara","Vanij","Vishti","Bava","Balava","Kaulava","Taitila"];
  return { name: k[idx % 11], pctLeft: (((diff % 6) / 6) * 100).toFixed(1) };
}

function buildGrahaInfo(planets, lagnaSign) {
  const order = ["As","Su","Mo","Ma","Me","Jp","Ve","Sa","Ra","Ke"];
  const fullNames = { As:"Lagna", Su:"Surya", Mo:"Chandra", Ma:"Mangala", Me:"Budha", Jp:"Guru", Ve:"Shukra", Sa:"Shani", Ra:"Rahu", Ke:"Ketu" };
  const karakas = { Su:"DK", Mo:"BK", Ma:"PK", Me:"GK", Jp:"AmK", Ve:"AK", Sa:"PiK", Ra:"MK" };
  return order.map(p => {
    const l = planets[p];
    const sign = getRashi(l);
    const house = ((sign - lagnaSign + 12) % 12) + 1;
    const nak = getNakshatra(l);
    const deg = getDegInSign(l);
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.floor(((deg - d) * 60 - m) * 60);
    return {
      id: p, name: fullNames[p], karaka: karakas[p] || "",
      sign: RASHIS[sign], signName: RASHI_NAMES[sign],
      lon: RASHIS[sign] + " " + d + "deg" + m + "m" + s + "s",
      nakshatra: NAKSHATRA_NAMES[nak] + "(" + (nak + 1) + ")",
      nakLord: NAKSHATRA_LORDS[nak], house
    };
  });
}
