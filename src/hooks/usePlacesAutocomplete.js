import { useState, useRef, useCallback, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let initPromise = null;

function initGoogle() {
  if (!initPromise) {
    setOptions({ apiKey: API_KEY, version: 'weekly' });
    initPromise = importLibrary('places').then((lib) => {
      console.log('✓ Places library loaded, keys:', Object.keys(lib).join(', '));
      return lib;
    });
  }
  return initPromise;
}

export function usePlacesSearch() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const libRef = useRef(null);

  useEffect(() => {
    if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('no-key');
      return;
    }
    initGoogle()
      .then((lib) => { libRef.current = lib; })
      .catch((err) => {
        console.error('Places init failed:', err);
        setError('load-failed');
      });
  }, []);

  const search = useCallback((query) => {
    clearTimeout(timerRef.current);
    if (!query || query.length < 2) { setSuggestions([]); return; }

    timerRef.current = setTimeout(async () => {
      try {
        const lib = libRef.current || await initGoogle();
        libRef.current = lib;
        setLoading(true);

        // Try new AutocompleteSuggestion API first (Places API New)
        if (lib.AutocompleteSuggestion) {
          const { suggestions: results } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
          });
          console.log('AutocompleteSuggestion results:', results?.length);
          setSuggestions(results?.map((s) => ({
            place_id: s.placePrediction?.placeId,
            description: s.placePrediction?.text?.text || '',
            structured_formatting: {
              main_text: s.placePrediction?.mainText?.text || '',
              secondary_text: s.placePrediction?.secondaryText?.text || '',
            },
            _place: s.placePrediction,
          })) || []);
        }
        // Fallback: legacy AutocompleteService
        else if (lib.AutocompleteService) {
          const svc = new lib.AutocompleteService();
          svc.getPlacePredictions({ input: query, types: ['geocode'] }, (results, status) => {
            console.log('AutocompleteService:', status, results?.length);
            setSuggestions(status === 'OK' ? results : []);
          });
        } else {
          console.error('No autocomplete API found in lib');
        }
      } catch (err) {
        console.error('Search error:', err);
      }
      setLoading(false);
    }, 350);
  }, []);

  const getDetails = useCallback(async (suggestion) => {
    try {
      const lib = libRef.current || await initGoogle();

      // New Places API
      if (suggestion._place?.fetchFields) {
        const place = suggestion._place;
        await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName'] });
        return {
          location: place.formattedAddress || place.displayName || suggestion.description,
          lat: place.location.lat().toFixed(6),
          lon: place.location.lng().toFixed(6),
        };
      }

      // Legacy PlacesService fallback
      return new Promise((resolve, reject) => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        const svc = new lib.PlacesService(div);
        svc.getDetails(
          { placeId: suggestion.place_id, fields: ['geometry', 'formatted_address', 'name'] },
          (place, status) => {
            document.body.removeChild(div);
            if (status === 'OK' && place?.geometry?.location) {
              resolve({
                location: place.formatted_address || place.name || suggestion.description,
                lat: place.geometry.location.lat().toFixed(6),
                lon: place.geometry.location.lng().toFixed(6),
              });
            } else {
              reject(new Error(`Details failed: ${status}`));
            }
          }
        );
      });
    } catch (err) {
      console.error('getDetails error:', err);
      throw err;
    }
  }, []);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, error, search, getDetails, clear };
}
