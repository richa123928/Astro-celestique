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

function yogaOf(tropicalMoonLon, tropicalSunLon) {
  const span = 360 / 27;
  const sum = norm360(tropicalMoonLon + tropicalSunLon);
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
    planets[body] = {
      longitude: Number(sidereal_[body].toFixed(4)),
      rashi: rashiOf(sidereal_[body])
    };
  });

  const nakshatra = nakshatraOf(sidereal_.Moon);
  const tithi = tithiOf(tropical.Moon, tropical.Sun);
  const yoga = yogaOf(tropical.Moon, tropical.Sun);
  const karana = karanaOf(tropical.Moon, tropical.Sun);
  const dasha = calculateVimshottariDasha(sidereal_.Moon, birthDate);

  return {
    ayanamsa: Number(ayanamsa.toFixed(4)),
    ascendant: {
      longitude: Number(ascendantSidereal.toFixed(4)),
      rashi: rashiOf(ascendantSidereal)
    },
    planets,
    panchang: { tithi, nakshatra, yoga, karana },
    dasha
  };
}

module.exports = { calculateVedicChart };