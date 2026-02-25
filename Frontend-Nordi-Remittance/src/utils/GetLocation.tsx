// ============================================================================
// GET LOCATION - IP-based geolocation (no browser permission required)
// Uses free ip-api.com service to detect user's country from their IP address
// ============================================================================

import { useState, useEffect } from 'react';
import Countries from '../core/data/Countries';

interface GeoIpResponse {
  status: string;
  country: string;
  countryCode: string;
  regionName: string;
  city: string;
}

const GetLocation = () => {
  const [country, setCountry] = useState<{ name: string; flag: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLocation = async () => {
      try {
        // ip-api.com — free, no API key, returns country from user's IP
        const response = await fetch(
          'http://ip-api.com/json/?fields=status,country,countryCode,regionName,city',
          { signal: controller.signal }
        );
        const data: GeoIpResponse = await response.json();

        if (data.status === 'success' && data.countryCode) {
          // Match against our local Countries list for the flag emoji
          const matched = Countries.find(
            (c) => c.code === data.countryCode
          );

          setCountry({
            name: matched?.name || data.country,
            flag: matched?.flag || '🌍',
          });
        }
      } catch {
        // Silently fail — location display is non-critical
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <span className="text-sm text-neutral-400 animate-pulse">
        Detecting location...
      </span>
    );
  }

  if (!country) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <span className="text-lg">{country.flag}</span>
      <span>{country.name}</span>
    </div>
  );
};

export default GetLocation;
