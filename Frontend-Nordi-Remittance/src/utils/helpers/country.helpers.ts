// ============================================================================
// COUNTRY HELPERS - Utility functions for fetching country data with local fallback
// ============================================================================

import localCountries from "../../core/data/Countries";

const REST_COUNTRIES_BASE_URL = "https://api.restcountries.com/countries/v5";
const AUTH_HEADER = {
  Authorization: "Bearer rc_live_a2a1b498384989428a99c5d23e415176c4",
};

/**
 * Interface representing the raw response from restcountries API
 */
interface RawCountryResponse {
  cca2: string;
  name: { common: string };
  idd?: { root?: string; suffixes?: string[] };
}

/**
 * Transforms the raw API response to the SelectOption format used in forms
 */
const transformCountryData = (data: any): SelectOption[] => {
  const countryArray = Array.isArray(data) ? data : data?.data || data?.countries || [];

  return countryArray
    .filter((country: any) => country && country.name && country.cca2)
    .map((country: any) => ({
      value: country.cca2,
      label: country.name?.common || country.cca2,
      code: country.idd?.root ? country.idd.root + (country.idd.suffixes?.[0] || "") : "",
    }))
    .sort((a: any, b: any) => a.label.localeCompare(b.label));
};

/**
 * Transforms local fallback countries (Countries.ts) to SelectOption format
 */
const getLocalCountries = (filterQuery?: string): SelectOption[] => {
  const filtered = filterQuery
    ? localCountries.filter((c) => c.name.toLowerCase().includes(filterQuery.toLowerCase()))
    : localCountries;

  return filtered
    .map((country) => ({
      value: country.code,
      label: country.name,
      code: country.code,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Fetches all countries from the API with fallback to local dataset
 * @returns Promise<SelectOption[]>
 */
export const fetchAllCountries = async (): Promise<SelectOption[]> => {
  try {
    const response = await fetch(`${REST_COUNTRIES_BASE_URL}?fields=name,cca2,idd`, {
      headers: AUTH_HEADER,
    });

    if (!response.ok) {
      console.warn("REST Countries API returned error status, falling back to local dataset:", response.status);
      return getLocalCountries();
    }

    const data = await response.json();
    const transformed = transformCountryData(data);
    return transformed.length > 0 ? transformed : getLocalCountries();
  } catch (error) {
    console.warn("REST Countries API fetch failed (e.g. CORS or network error), falling back to local dataset:", error);
    return getLocalCountries();
  }
};

/**
 * Searches for countries by name using the API with fallback to local dataset
 * @param query The country name to search for
 * @returns Promise<SelectOption[]>
 */
export const searchCountriesByName = async (query: string): Promise<SelectOption[]> => {
  if (!query || query.trim() === "") {
    return fetchAllCountries();
  }

  try {
    const response = await fetch(`${REST_COUNTRIES_BASE_URL}?q=${encodeURIComponent(query)}&fields=name,cca2,idd`, {
      headers: AUTH_HEADER,
    });

    if (response.status === 404) {
      return getLocalCountries(query);
    }

    if (!response.ok) {
      console.warn(`REST Countries API search failed with status ${response.status}, falling back to local dataset.`);
      return getLocalCountries(query);
    }

    const data = await response.json();
    const transformed = transformCountryData(data);
    return transformed.length > 0 ? transformed : getLocalCountries(query);
  } catch (error) {
    console.warn(`REST Countries API search failed for "${query}", falling back to local dataset:`, error);
    return getLocalCountries(query);
  }
};
