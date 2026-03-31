import { useState, useEffect, useCallback } from 'react';
import Countries from '../core/data/Countries';

interface GeoIpResponse {
  status: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
}

export interface DetectedCountry {
  name: string;
  code: string;
  flag: string;
}

export const useGeoLocation = () => {
  const [detectedCountry, setDetectedCountry] = useState<DetectedCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ip-api.com — free, no API key, returns country from user's IP
      const response = await fetch(
        'http://ip-api.com/json/?fields=status,country,countryCode,regionName,city'
      );
      const data: GeoIpResponse = await response.json();

      if (data.status === 'success' && data.countryCode) {
        // Match against our local Countries list for the flag emoji
        const matched = Countries.find(
          (c) => c.code === data.countryCode
        );

        setDetectedCountry({
          name: matched?.name || data.country,
          code: data.countryCode,
          flag: matched?.flag || '🌍',
        });
      } else {
        throw new Error('Failed to detect location');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Fallback to US if detection fails
      const matched = Countries.find((c) => c.code === 'US');
      if (matched) {
          setDetectedCountry({
              name: matched.name,
              code: matched.code,
              flag: matched.flag,
          });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { detectedCountry, loading, error, refetch: fetchLocation };
};
