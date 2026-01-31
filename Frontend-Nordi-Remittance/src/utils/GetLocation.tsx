import React, { useState, useEffect } from 'react';
import Countries from '../core/data/Countries';

const GetLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [country, setCountry] = useState<{ name: string; flag: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Loading state added

  // Get user's location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchCountryFromLocation(latitude, longitude);
        },
        (error) => {
          setError('Error fetching location. Please enable location services.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Fetch country based on latitude and longitude
  const fetchCountryFromLocation = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://geocode.xyz/${lat},${lon}?geoit=json`
      );
      const data = await response.json();
      const countryCode = data.prov; // Adjust based on API response, prov often returns country code

      const matchedCountry = Countries.find(
        (country) => country.code === countryCode
      );

      if (matchedCountry) {
        setCountry({ name: matchedCountry.name, flag: matchedCountry.flag });
      } else {
        setError('Country not found for your location.');
      }
    } catch (err) {
      setError('Error fetching country information.');
    } finally {
        setLoading(false)
    }
  };

  if(loading) return <> Loading...</>

  return (
    <div>
    {country ? (
      <div className='flex space-x-4'>
        <h3>{country.name}</h3>
        <p>{country.flag}</p>
      </div>
    ) : (
      <div>No country information available</div>
    )}
  </div>
  );
};

export default GetLocation;
