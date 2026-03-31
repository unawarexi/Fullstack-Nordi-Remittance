// ============================================================================
// GET LOCATION - IP-based geolocation (no browser permission required)
// Uses free ip-api.com service to detect user's country from their IP address
// ============================================================================

import { useGeoLocation } from '../hooks/useGeoLocation';

const GetLocation = () => {
  const { detectedCountry, loading } = useGeoLocation();

  if (loading) {
    return (
      <span className="text-sm text-neutral-400 animate-pulse">
        Detecting location...
      </span>
    );
  }

  if (!detectedCountry) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <span className="text-lg">{detectedCountry.flag}</span>
      <span>{detectedCountry.name}</span>
    </div>
  );
};

export default GetLocation;
