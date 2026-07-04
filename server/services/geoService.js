const axios = require('axios');
const tzlookup = require('tz-lookup');
const { DateTime } = require('luxon');

/**
 * Geocode a free-text place name into coordinates using OpenStreetMap Nominatim.
 * Free, no API key required.
 */
async function geocodePlace(placeText) {
  if (!placeText || !placeText.trim()) {
    throw new Error('Place of birth is required');
  }

  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: placeText, format: 'json', limit: 1, addressdetails: 0 },
    headers: {
      'User-Agent': 'AstroCelestique/1.0 (contact@astrocelestique.com)'
    },
    timeout: 8000
  });

  const results = response.data;
  if (!results || results.length === 0) return null;

  const best = results[0];
  return {
    lat: parseFloat(best.lat),
    lng: parseFloat(best.lon),
    displayName: best.display_name
  };
}

function resolveTimezone(lat, lng) {
  return tzlookup(lat, lng);
}

function resolveUtcOffset(dateStr, timeStr, timezone) {
  const time = timeStr || '06:00';
  const dt = DateTime.fromFormat(`${dateStr} ${time}`, 'yyyy-MM-dd HH:mm', { zone: timezone });

  if (!dt.isValid) {
    throw new Error(`Invalid date/time/timezone combination: ${dt.invalidReason}`);
  }

  return {
    utcOffsetMinutes: dt.offset,
    utcDateTime: dt.toUTC().toISO(),
    localDateTime: dt.toISO()
  };
}

async function resolveBirthLocation(placeText, dateStr, timeStr) {
  const geo = await geocodePlace(placeText);
  if (!geo) {
    const err = new Error(
      `Could not find "${placeText}". Try adding state/country, e.g. "Gwalior, Madhya Pradesh, India".`
    );
    err.code = 'PLACE_NOT_FOUND';
    throw err;
  }

  const timezone = resolveTimezone(geo.lat, geo.lng);
  const offsetInfo = resolveUtcOffset(dateStr, timeStr, timezone);

  return { lat: geo.lat, lng: geo.lng, displayName: geo.displayName, timezone, ...offsetInfo };
}

module.exports = { geocodePlace, resolveTimezone, resolveUtcOffset, resolveBirthLocation };