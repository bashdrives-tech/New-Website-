import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Simple in-memory cache for fast autocomplete responses
const searchCache = new Map();
const distanceCache = new Map();

// Free Autocomplete API using OpenStreetMap / Photon geocoder
app.get('/api/autocomplete', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ results: [] });
    }

    const cacheKey = q.toLowerCase();
    if (searchCache.has(cacheKey)) {
      return res.json({ results: searchCache.get(cacheKey) });
    }

    // Try Photon (OSM-powered, free, fast search-as-you-type geocoder)
    // Biased around Coimbatore (lat 11.0168, lon 76.9558)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=7&lat=11.0168&lon=76.9558`;
    const response = await fetch(photonUrl, {
      headers: { 'User-Agent': 'Quicktaxi-Coimbatore/1.0' }
    });

    if (!response.ok) {
      throw new Error(`Photon responded with ${response.status}`);
    }

    const data = await response.json();
    const results = (data.features || []).map((item) => {
      const props = item.properties || {};
      const coords = item.geometry?.coordinates || [0, 0];
      const name = props.name || props.street || props.city || q;
      
      const subParts = [props.district, props.city, props.state, props.postcode]
        .filter(Boolean)
        .filter((val, idx, arr) => arr.indexOf(val) === idx && val !== name);
      
      const subtitle = subParts.join(', ') || 'Tamil Nadu, India';

      return {
        name,
        subtitle,
        fullName: `${name}, ${subtitle}`,
        lat: coords[1],
        lon: coords[0],
        type: props.type || props.osm_value || 'place',
        provider: 'OpenStreetMap'
      };
    });

    if (results.length > 0) {
      if (searchCache.size > 200) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }
      searchCache.set(cacheKey, results);
    }

    return res.json({ results });
  } catch (err) {
    console.error('Autocomplete error:', err.message);
    // Fallback: search Nominatim directly
    try {
      const q = req.query.q || '';
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=6&addressdetails=1`;
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'Quicktaxi-Coimbatore/1.0 (support@quicktaxi.co.in)' }
      });
      const nomData = await nomRes.json();
      const results = (nomData || []).map((item) => ({
        name: item.name || item.display_name.split(',')[0],
        subtitle: item.display_name.split(',').slice(1, 4).join(',').trim(),
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type || 'place',
        provider: 'OpenStreetMap'
      }));
      return res.json({ results });
    } catch (fallbackErr) {
      return res.json({ results: [] });
    }
  }
});

// Free Routing & Road Distance API using Project OSRM
app.get('/api/distance', async (req, res) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const cacheKey = `${fromLat},${fromLon}:${toLat},${toLon}`;
    if (distanceCache.has(cacheKey)) {
      return res.json(distanceCache.get(cacheKey));
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const response = await fetch(osrmUrl, {
      headers: { 'User-Agent': 'Quicktaxi-Coimbatore/1.0' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const distanceMeters = data.routes[0].distance;
        const durationSeconds = data.routes[0].duration;
        const distanceKm = Math.round(distanceMeters / 1000);
        const durationMin = Math.round(durationSeconds / 60);

        const result = { distanceKm, durationMin, source: 'OSRM Driving Route' };
        if (distanceCache.size > 200) {
          const firstKey = distanceCache.keys().next().value;
          distanceCache.delete(firstKey);
        }
        distanceCache.set(cacheKey, result);
        return res.json(result);
      }
    }

    // Fallback: Haversine distance with road winding tortuosity factor (~1.28)
    const R = 6371; // Earth radius in km
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLon = (toLon - fromLon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const straightDist = R * c;
    const estimatedRoadKm = Math.round(straightDist * 1.28);

    return res.json({ distanceKm: estimatedRoadKm, durationMin: Math.round(estimatedRoadKm * 1.5), source: 'Estimated Road Metric' });
  } catch (err) {
    console.error('Distance error:', err.message);
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
});

// Free Reverse Geocoding for current GPS location
app.get('/api/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'Missing coordinates' });

    const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(revUrl, {
      headers: { 'User-Agent': 'Quicktaxi-Coimbatore/1.0 (support@quicktaxi.co.in)' }
    });
    if (!response.ok) throw new Error('Reverse geocode failed');
    const data = await response.json();
    const addr = data.address || {};
    const name = addr.road || addr.suburb || addr.neighbourhood || addr.city || data.display_name.split(',')[0];
    const city = addr.city || addr.town || addr.county || 'Coimbatore';
    return res.json({
      name,
      fullName: `${name}, ${city}`,
      lat: parseFloat(lat),
      lon: parseFloat(lon)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static assets from root directory
app.use(express.static(__dirname));

// Robots.txt for Google Ads and search engine crawlers
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: AdsBot-Google-Mobile
Allow: /

User-agent: Mediapartners-Google
Allow: /
`);
});

// Dedicated crawlable routes for Google Ads policy compliance
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

// Route for oneway drop landing page
app.get('/oneway', (req, res) => {
  res.sendFile(path.join(__dirname, 'oneway.html'));
});

// Fallback route to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Quicktaxi server running on http://0.0.0.0:${PORT}`);
});
