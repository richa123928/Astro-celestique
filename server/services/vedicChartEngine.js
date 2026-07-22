const julian = require('astronomia/julian');
const solar = require('astronomia/solar');
const moonposition = require('astronomia/moonposition');
const nutation = require('astronomia/nutation');
const sidereal = require('astronomia/sidereal');
const planetposition = require('astronomia/planetposition');

const vsop87Bearth   = require('astronomia/data/vsop87Bearth').default;
const vsop87Bmercury = require('astronomia/data/vsop87Bmercury').default;
const vsop87Bvenus   = require('astronomia/data/vsop87Bvenus').default;
const vsop87Bmars    = require('astronomia/data/vsop87Bmars').default;
const vsop87Bjupiter = require('astronomia/data/vsop87Bjupiter').default;
const vsop87Bsaturn  = require('astronomia/data/vsop87Bsaturn').default;

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;
const norm360 = (d) => ((d % 360) + 360) % 360;

const earth   = new planetposition.Planet(vsop87Bearth);
const mercury = new planetposition.Planet(vsop87Bmercury);
const venus   = new planetposition.Planet(vsop87Bvenus);
const mars    = new planetposition.Planet(vsop87Bmars);
const jupiter = new planetposition.Planet(vsop87Bjupiter);
const saturn  = new planetposition.Planet(vsop87Bsaturn);

const RASHI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
  'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda',
  'Sukarma', 'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garija', 'Vanija', 'Vishti'];

const DASHA_LORD_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
const DASHA_YEAR_LENGTH_DAYS = 365.25;

function dateToJde(date) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const dayFrac = date.getUTCDate() +
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  return julian.CalendarGregorianToJD(y, m, dayFrac);
}

/**
 * Lahiri ayanamsa approximation (degrees), referenced to J2000.0.
 * Linear approximation, accurate to a few arcseconds around J2000 — good
 * enough for chart generation, but cross-check against Swiss Ephemeris
 * before relying on it for edge-of-sign cases.
 */
function lahiriAyanamsa(jde) {
  const yearsFromJ2000 = (jde - 2451545.0) / 365.25;
  return 23.8531 + 0.0139552 * yearsFromJ2000;
}

function heliocentricRect(planet, jde) {
  const { lon, lat, range } = planet.position(jde);
  return {
    x: range * Math.cos(lat) * Math.cos(lon),
    y: range * Math.cos(lat) * Math.sin(lon),
    z: range * Math.sin(lat)
  };
}

/**
 * Geocentric apparent ecliptic longitude (tropical, degrees) for an outer
 * body, via rectangular vector subtraction + one light-time iteration.
 * NOT valid for the Sun — use solar.apparentVSOP87(earth, jde) for that.
 */
function geocentricLongitude(planet, jde) {
  const earthRect = heliocentricRect(earth, jde);
  let planetRect = heliocentricRect(planet, jde);
  let dx = planetRect.x - earthRect.x;
  let dy = planetRect.y - earthRect.y;
  let dz = planetRect.z - earthRect.z;
  let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const tau = 0.0057755183 * dist; // light-time, days
  planetRect = heliocentricRect(planet, jde - tau);
  dx = planetRect.x - earthRect.x;
  dy = planetRect.y - earthRect.y;
  dz = planetRect.z - earthRect.z;

  let lon = Math.atan2(dy, dx);
  const dPsi = nutation.nutation(jde)[0];
  lon = lon + dPsi;
  return norm360(lon * R2D);
}

function calculateAscendant(jde, latDeg, lngDeg) {
  const gstDeg = norm360(sidereal.apparent(jde) / 240);
  const ramcDeg = norm360(gstDeg + lngDeg);
  const ramcRad = ramcDeg * D2R;
  const latRad = latDeg * D2R;
  const obliq = nutation.meanObliquity(jde);

  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(obliq) + Math.tan(latRad) * Math.sin(obliq));
  return norm360(Math.atan2(y, x) * R2D);
}

function rashiOf(siderealLon) {
  return RASHI_NAMES[Math.floor(norm360(siderealLon) / 30)];
}

function nakshatraOf(siderealMoonLon) {
  const span = 360 / 27;
  const lon = norm360(siderealMoonLon);
  const index = Math.floor(lon / span);
  const pada = Math.floor((lon % span) / (span / 4)) + 1;
  return { name: NAKSHATRA_NAMES[index], index, pada };
}

function tithiOf(tropicalMoonLon, tropicalSunLon) {
  const diff = norm360(tropicalMoonLon - tropicalSunLon);
  const index = Math.floor(diff / 12);
  const paksha = index < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const number = index < 15 ? index + 1 : index - 14;
  return { index, paksha, number, label: `${paksha}, Tithi ${number}` };
}

// IMPORTANT: Yoga is based on the SUM of Sun+Moon longitudes, so ayanamsa
// does NOT cancel out the way it does for Tithi/Karana (which use the
// DIFFERENCE). This MUST be called with sidereal longitudes, not tropical.
function yogaOf(siderealMoonLon, siderealSunLon) {
  const span = 360 / 27;
  const sum = norm360(siderealMoonLon + siderealSunLon);
  const index = Math.floor(sum / span);
  return { name: YOGA_NAMES[index], index };
}

function karanaOf(tropicalMoonLon, tropicalSunLon) {
  const diff = norm360(tropicalMoonLon - tropicalSunLon);
  const index = Math.floor(diff / 6);
  let name;
  if (index === 0) name = 'Kimstughna';
  else if (index >= 57) name = ['Shakuni', 'Chatushpada', 'Naga'][index - 57];
  else name = KARANA_MOVABLE[(index - 1) % 7];
  return { name, index };
}

function calculateVimshottariDasha(siderealMoonLon, birthDate, asOfDate = new Date()) {
  const span = 360 / 27;
  const lon = norm360(siderealMoonLon);
  const nakIndex = Math.floor(lon / span);
  const startLord = DASHA_LORD_ORDER[nakIndex % 9];
  const fractionElapsed = (lon % span) / span;
  const balanceYears = (1 - fractionElapsed) * DASHA_YEARS[startLord];

  const periods = [];
  let cursor = new Date(birthDate);
  let lordIdx = DASHA_LORD_ORDER.indexOf(startLord);

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORD_ORDER[lordIdx % 9];
    const durationYears = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + durationYears * DASHA_YEAR_LENGTH_DAYS * 86400000);
    periods.push({ lord, start, end, durationYears: Number(durationYears.toFixed(2)) });
    cursor = end;
    lordIdx++;
  }

  const current = periods.find((p) => asOfDate >= p.start && asOfDate < p.end) || periods[periods.length - 1];

  return {
    moonNakshatra: NAKSHATRA_NAMES[nakIndex],
    startingLord: startLord,
    current: {
      lord: current.lord,
      start: current.start.toISOString().slice(0, 10),
      end: current.end.toISOString().slice(0, 10)
    },
    sequence: periods.map((p) => ({
      lord: p.lord,
      start: p.start.toISOString().slice(0, 10),
      end: p.end.toISOString().slice(0, 10)
    }))
  };
}

function degreeInSign(siderealLon) {
  const deg = norm360(siderealLon) % 30;
  const wholeDeg = Math.floor(deg);
  const minutes = Math.round((deg - wholeDeg) * 60);
  return { degree: wholeDeg, minutes, formatted: `${wholeDeg}°${minutes}'` };
}

/**
 * Navamsa (D9) sign index for a given sidereal longitude, using the
 * standard unified formula: movable signs start their navamsa cycle from
 * themselves, fixed signs from the 9th sign, dual signs from the 5th —
 * this formula produces exactly that classical result without needing
 * separate branches per sign type.
 */
function navamsaIndexOf(siderealLon) {
  const lon = norm360(siderealLon);
  const rashiIndex = Math.floor(lon / 30);
  const degreeInRashi = lon % 30;
  const navamsaUnit = Math.floor(degreeInRashi / (30 / 9));
  return (rashiIndex * 9 + navamsaUnit) % 12;
}

/**
 * Retrograde check: compare a body's geocentric longitude 1 day apart. If
 * it moved backward (accounting for 360° wraparound), it's retrograde.
 * Sun and Moon are never retrograde geocentrically, so skip those. Rahu/Ketu
 * (mean lunar node) are always retrograde by definition of the mean node.
 */
function isRetrograde(getLonFn, jde) {
  const lonNow = getLonFn(jde);
  const lonYesterday = getLonFn(jde - 1);
  let diff = lonNow - lonYesterday;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}


function calculateVedicChart({ utcDateTime, lat, lng }) {
  const birthDate = new Date(utcDateTime);
  const jde = dateToJde(birthDate);
  const ayanamsa = lahiriAyanamsa(jde);

  const tropical = {
    Sun: norm360(solar.apparentVSOP87(earth, jde).lon * R2D),
    Moon: norm360(moonposition.position(jde).lon * R2D),
    Mercury: geocentricLongitude(mercury, jde),
    Venus: geocentricLongitude(venus, jde),
    Mars: geocentricLongitude(mars, jde),
    Jupiter: geocentricLongitude(jupiter, jde),
    Saturn: geocentricLongitude(saturn, jde),
    Rahu: norm360(moonposition.node(jde) * R2D)
  };
  tropical.Ketu = norm360(tropical.Rahu + 180);

  const ascendantTropical = calculateAscendant(jde, lat, lng);

  const sidereal_ = {};
  Object.keys(tropical).forEach((body) => {
    sidereal_[body] = norm360(tropical[body] - ayanamsa);
  });
  const ascendantSidereal = norm360(ascendantTropical - ayanamsa);

 const planets = {};
  Object.keys(sidereal_).forEach((body) => {
    const retrograde = body === 'Sun' || body === 'Moon'
      ? false
      : body === 'Rahu' || body === 'Ketu'
      ? true
      : isRetrograde((j) => {
          const map = { Mercury: mercury, Venus: venus, Mars: mars, Jupiter: jupiter, Saturn: saturn };
          return geocentricLongitude(map[body], j);
        }, jde);

    planets[body] = {
      longitude: Number(sidereal_[body].toFixed(4)),
      rashi: rashiOf(sidereal_[body]),
      degree: degreeInSign(sidereal_[body]),
      retrograde,
      navamsaRashi: RASHI_NAMES[navamsaIndexOf(sidereal_[body])]
    };
  });

  const nakshatra = nakshatraOf(sidereal_.Moon);
  const tithi = tithiOf(tropical.Moon, tropical.Sun);
  const yoga = yogaOf(sidereal_.Moon, sidereal_.Sun);
  const karana = karanaOf(tropical.Moon, tropical.Sun);
  const dasha = calculateVimshottariDasha(sidereal_.Moon, birthDate);

  return {
    ayanamsa: Number(ayanamsa.toFixed(4)),
    ascendant: {
      longitude: Number(ascendantSidereal.toFixed(4)),
      rashi: rashiOf(ascendantSidereal),
      degree: degreeInSign(ascendantSidereal),
      navamsaRashi: RASHI_NAMES[navamsaIndexOf(ascendantSidereal)]
    },
    planets,
    panchang: { tithi, nakshatra, yoga, karana },
    dasha
  };
}

// ---- Daily Panchang (date-based, not birth-specific) ----

/**
 * Sunrise/sunset via the standard NOAA solar calculator algorithm.
 * Accurate to ~1 minute — plenty precise for Rahu Kaal / Muhurta division,
 * and self-contained (doesn't need iteration).
 */
function calculateSunTimes(dateUTC, latDeg, lngDeg) {
  const start = Date.UTC(dateUTC.getUTCFullYear(), 0, 1);
  const dayOfYear = Math.floor((dateUTC - start) / 86400000) + 1;

  const gamma = (2 * Math.PI / 365) * (dayOfYear - 1 + 12 / 24);

  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

  const latRad = latDeg * D2R;
  const zenith = 90.833 * D2R; // includes refraction + solar disk radius

  const cosHa = (Math.cos(zenith) / (Math.cos(latRad) * Math.cos(decl))) - Math.tan(latRad) * Math.tan(decl);
  const clamped = Math.max(-1, Math.min(1, cosHa));
  const ha = Math.acos(clamped) * R2D;

  const solarNoonMinutes = 720 - 4 * lngDeg - eqTime;
  const sunriseMinutes = solarNoonMinutes - ha * 4;
  const sunsetMinutes = solarNoonMinutes + ha * 4;

  const dayStart = Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate());
  return {
    sunrise: new Date(dayStart + sunriseMinutes * 60000),
    sunset: new Date(dayStart + sunsetMinutes * 60000)
  };
}

// Standard, widely-used weekday tables for dividing daylight into 8 equal
// parts (0=Sunday...6=Saturday). segmentIndex is 1-based (which of the 8
// daylight segments belongs to that period).
const RAHU_KAAL_SEGMENT   = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_SEGMENT   = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_KAAL_SEGMENT = [7, 6, 5, 4, 3, 2, 1];

function segmentToTimeRange(sunrise, sunset, segmentIndex) {
  const daylightMs = sunset.getTime() - sunrise.getTime();
  const segmentMs = daylightMs / 8;
  const start = new Date(sunrise.getTime() + (segmentIndex - 1) * segmentMs);
  const end = new Date(sunrise.getTime() + segmentIndex * segmentMs);
  return { start, end };
}

function formatTimeRange(start, end, timezone) {
  const opts = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone };
  return `${start.toLocaleTimeString('en-IN', opts)} - ${end.toLocaleTimeString('en-IN', opts)}`;
}

/**
 * Full daily Panchang for a given calendar date, computed the traditional
 * way — tithi/nakshatra/yoga/karana as they stand at sunrise (Indian
 * panchang convention), not midnight or noon.
 *
 * @param {Object} params
 * @param {string} params.date - "YYYY-MM-DD"
 * @param {number} [params.lat=28.6139] - defaults to New Delhi
 * @param {number} [params.lng=77.2090]
 * @param {string} [params.timezone='Asia/Kolkata']
 */
function calculateDailyPanchang({ date, lat = 28.6139, lng = 77.2090, timezone = 'Asia/Kolkata' }) {
  const [y, m, d] = date.split('-').map(Number);
  const dateUTCNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // rough anchor for sun-time calc

  const { sunrise, sunset } = calculateSunTimes(dateUTCNoon, lat, lng);

  const jde = dateToJde(sunrise);
  const ayanamsa = lahiriAyanamsa(jde);

  const tropicalSun = norm360(solar.apparentVSOP87(earth, jde).lon * R2D);
  const tropicalMoon = norm360(moonposition.position(jde).lon * R2D);

  const tropicalPlanets = {
    Sun: tropicalSun,
    Moon: tropicalMoon,
    Mercury: geocentricLongitude(mercury, jde),
    Venus: geocentricLongitude(venus, jde),
    Mars: geocentricLongitude(mars, jde),
    Jupiter: geocentricLongitude(jupiter, jde),
    Saturn: geocentricLongitude(saturn, jde),
    Rahu: norm360(moonposition.node(jde) * R2D)
  };
  tropicalPlanets.Ketu = norm360(tropicalPlanets.Rahu + 180);

  const planets = {};
  Object.keys(tropicalPlanets).forEach((body) => {
    const sid = norm360(tropicalPlanets[body] - ayanamsa);
    planets[body] = { longitude: Number(sid.toFixed(4)), rashi: rashiOf(sid) };
  });

  const dayOfWeek = sunrise.getUTCDay(); // 0=Sunday
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const rahuKaal = segmentToTimeRange(sunrise, sunset, RAHU_KAAL_SEGMENT[dayOfWeek]);
  const yamaganda = segmentToTimeRange(sunrise, sunset, YAMAGANDA_SEGMENT[dayOfWeek]);
  const gulikaKaal = segmentToTimeRange(sunrise, sunset, GULIKA_KAAL_SEGMENT[dayOfWeek]);

  const muhurtaMs = (sunset.getTime() - sunrise.getTime()) / 15;
  const abhijitStart = new Date(sunrise.getTime() + 7 * muhurtaMs);
  const abhijitEnd = new Date(sunrise.getTime() + 8 * muhurtaMs);
  const brahmaStart = new Date(sunrise.getTime() - 96 * 60000);
  const brahmaEnd = new Date(sunrise.getTime() - 48 * 60000);

  return {
    date,
    var: weekdayNames[dayOfWeek],
    ayanamsa: Number(ayanamsa.toFixed(4)),
    sunrise: sunrise.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }),
    sunset: sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone }),
    panchang: {
      tithi: tithiOf(tropicalMoon, tropicalSun),
      nakshatra: nakshatraOf(planets.Moon.longitude),
      yoga: yogaOf(planets.Moon.longitude, planets.Sun.longitude),
      karana: karanaOf(tropicalMoon, tropicalSun)
    },
    planets,
    auspicious: [
      { label: 'Abhijit Muhurta', time: formatTimeRange(abhijitStart, abhijitEnd, timezone) },
      { label: 'Brahma Muhurta', time: formatTimeRange(brahmaStart, brahmaEnd, timezone) }
    ],
    inauspicious: [
      { label: 'Rahu Kaal', time: formatTimeRange(rahuKaal.start, rahuKaal.end, timezone) },
      { label: 'Yamaganda', time: formatTimeRange(yamaganda.start, yamaganda.end, timezone) },
      { label: 'Gulika Kaal', time: formatTimeRange(gulikaKaal.start, gulikaKaal.end, timezone) }
    ]
  };
}

// ---- Lightweight helpers for calculators that only have a DOB (no birth
// time/place collected) — e.g. numerology, moon-sign, compatibility pages.
// These use a noon-UTC reference time, which is accurate for Rashi/Nakshatra
// on the vast majority of days (Moon moves ~13°/day, so it only risks being
// wrong right around a boundary-crossing day) — far more accurate than a
// calendar-date hash, but flagged here as an approximation since no birth
// time means we can't pin down the Moon's position as precisely as the full
// Kundli engine does.
function getMoonSignAndNakshatra(dob) {
  const date = new Date(dob + 'T12:00:00Z');
  const jde = dateToJde(date);
  const ayanamsa = lahiriAyanamsa(jde);
  const tropicalMoon = norm360(moonposition.position(jde).lon * R2D);
  const siderealMoon = norm360(tropicalMoon - ayanamsa);
  return {
    rashi: rashiOf(siderealMoon),
    rashiIndex: Math.floor(siderealMoon / 30),
    nakshatra: nakshatraOf(siderealMoon)
  };
}

const GANA_MAP = {
  Deva: ['Ashwini', 'Mrigashira', 'Punarvasu', 'Pushya', 'Hasta', 'Swati', 'Anuradha', 'Shravana', 'Revati'],
  Manushya: ['Bharani', 'Rohini', 'Ardra', 'Purva Phalguni', 'Uttara Phalguni', 'Purva Ashadha', 'Uttara Ashadha', 'Purva Bhadrapada', 'Uttara Bhadrapada'],
  Rakshasa: ['Krittika', 'Ashlesha', 'Magha', 'Chitra', 'Vishakha', 'Jyeshtha', 'Mula', 'Dhanishta', 'Shatabhisha']
};

function ganaOf(nakshatraName) {
  for (const gana of Object.keys(GANA_MAP)) {
    if (GANA_MAP[gana].includes(nakshatraName)) return gana;
  }
  return 'Manushya';
}

/**
 * Partial Ashtakoot compatibility — Bhakoot (rashi distance, 7 pts) + Gana
 * (nature/temperament, 6 pts) = 13 points max. This is NOT the full
 * traditional 8-factor/36-point Ashtakoot Guna Milan (which needs birth
 * time+place for Nadi, Graha Maitri, Yoni, Tara, Varna, Vasya too) — it's a
 * smaller, honest subset that's still genuinely computed from real Moon
 * positions rather than a hash of the two names/dates.
 */
function calculateCompatibility(dob1, dob2) {
  const p1 = getMoonSignAndNakshatra(dob1);
  const p2 = getMoonSignAndNakshatra(dob2);

  const distance = ((p2.rashiIndex - p1.rashiIndex + 12) % 12) + 1;
  const badBhakootDistances = [2, 12, 5, 9, 6, 8];
  const bhakootPoints = badBhakootDistances.includes(distance) ? 0 : 7;

  const gana1 = ganaOf(p1.nakshatra.name);
  const gana2 = ganaOf(p2.nakshatra.name);
  let ganaPoints;
  if (gana1 === gana2) ganaPoints = 6;
  else if ([gana1, gana2].includes('Rakshasa')) ganaPoints = 0;
  else ganaPoints = 5;

  const totalPoints = bhakootPoints + ganaPoints;
  const maxPoints = 13;
  const percentageScore = Math.round((totalPoints / maxPoints) * 100);

  return {
    person1: { rashi: p1.rashi, nakshatra: p1.nakshatra.name, gana: gana1 },
    person2: { rashi: p2.rashi, nakshatra: p2.nakshatra.name, gana: gana2 },
    bhakootPoints,
    bhakootMax: 7,
    ganaPoints,
    ganaMax: 6,
    totalPoints,
    maxPoints,
    percentageScore,
    note: 'Based on Moon sign (Bhakoot) and Nakshatra temperament (Gana) — 2 of the 8 traditional Ashtakoot factors. Full 36-point matching also requires birth time and place for the remaining factors (Nadi, Graha Maitri, Yoni, Tara, Varna, Vasya).'
  };
}

// ---- Moon phase (for the standalone "Moon Phase" calculator) ----

const MOON_PHASES = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];

function getMoonPhaseForDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00Z');
  const jde = dateToJde(date);
  const tropicalSun = norm360(solar.apparentVSOP87(earth, jde).lon * R2D);
  const tropicalMoon = norm360(moonposition.position(jde).lon * R2D);
  const tithi = tithiOf(tropicalMoon, tropicalSun);
  const phaseIndex = Math.floor(tithi.index / 3.75);
  return { phase: MOON_PHASES[phaseIndex], tithi: tithi.label };
}

module.exports = {
  calculateVedicChart,
  calculateDailyPanchang,
  getMoonSignAndNakshatra,
  calculateCompatibility,
  getMoonPhaseForDate
};