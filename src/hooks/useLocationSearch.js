import { useState, useRef, useCallback } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Simple location search using Google Geocoding API
export function useLocationSearch() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const search = useCallback((query) => {
    clearTimeout(timerRef.current);

    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('no-key');
      setSuggestions([]);
      return;
    }

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Use Geocoding API - simpler and more reliable
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        console.log('Geocoding API response:', data.status, data.results?.length || 0);

        if (data.status === 'OK' && data.results) {
          const results = data.results.slice(0, 5).map((result) => ({
            id: result.place_id,
            address: result.formatted_address,
            lat: result.geometry.location.lat,
            lon: result.geometry.location.lng,
            types: result.types,
          }));
          setSuggestions(results);
        } else if (data.status === 'ZERO_RESULTS') {
          setSuggestions([]);
        } else {
          console.error('Geocoding error:', data.status, data.error_message);
          setError(data.status);
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setError('network-error');
        setSuggestions([]);
      }

      setLoading(false);
    }, 400);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, loading, error, search, clear };
}
