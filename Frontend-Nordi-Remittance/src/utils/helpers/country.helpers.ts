// ============================================================================
// COUNTRY HELPERS - Utility functions for fetching country data
// ============================================================================

const REST_COUNTRIES_BASE_URL = "https://restcountries.com/v3.1";
const REQUIRED_FIELDS = "name,cca2,idd";

/**
 * Interface representing the raw response from restcountries API
 */
interface RawCountryResponse {
  cca2: string;
  name: { common: string };
  idd: { root?: string; suffixes?: string[] };
}

/**
 * Transforms the raw API response to the SelectOption format used in forms
 */
const transformCountryData = (data: RawCountryResponse[]): SelectOption[] => {
  return data
    .map((country) => ({
      value: country.cca2,
      label: country.name.common,
      code: country.idd.root
        ? country.idd.root + (country.idd.suffixes?.[0] || "")
        : "",
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Fetches all countries from the API
 * @returns Promise<SelectOption[]>
 */
export const fetchAllCountries = async (): Promise<SelectOption[]> => {
  try {
    const response = await fetch(
      `${REST_COUNTRIES_BASE_URL}/all?fields=${REQUIRED_FIELDS}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`);
    }
    const data: RawCountryResponse[] = await response.json();
    return transformCountryData(data);
  } catch (error) {
    console.error("Error fetching all countries:", error);
    return [];
  }
};

/**
 * Searches for countries by name using the API
 * @param query The country name to search for
 * @returns Promise<SelectOption[]>
 */
export const searchCountriesByName = async (
  query: string,
): Promise<SelectOption[]> => {
  if (!query || query.trim() === "") {
    return fetchAllCountries();
  }

  try {
    const response = await fetch(
      `${REST_COUNTRIES_BASE_URL}/name/${encodeURIComponent(query)}?fields=${REQUIRED_FIELDS}`,
    );

    // The API returns 404 if no countries match the query
    if (response.status === 404) {
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to search countries: ${response.statusText}`);
    }

    const data: RawCountryResponse[] = await response.json();
    return transformCountryData(data);
  } catch (error) {
    console.error(`Error searching countries with query "${query}":`, error);
    return [];
  }
};
