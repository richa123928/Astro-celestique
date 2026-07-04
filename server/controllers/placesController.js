const axios = require('axios');

const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

exports.searchPlaces = async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (query.length < 2) return res.status(200).json({ success: true, results: [] });

    const cacheKey = query.toLowerCase();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.status(200).json({ success: true, results: cached.results });
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 6, addressdetails: 1 },
      headers: { 'User-Agent': 'AstroCelestique/1.0 (contact@astrocelestique.com)' },
      timeout: 8000
    });

    const results = response.data.map(place => ({
      displayName: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon)
    }));

    cache.set(cacheKey, { results, timestamp: Date.now() });
    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('Place search error:', err.message);
    res.status(500).json({ success: false, message: 'Could not search places right now. Please try again.' });
  }
};