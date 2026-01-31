// ============================================================================
// IBAN & SWIFT HELPERS - Banking validation and country-specific logic
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface CountryBankingInfo {
  code: string;
  name: string;
  usesIban: boolean;
  ibanLength?: number;
  ibanFormat?: RegExp;
  routingName?: string; // e.g., "Routing Number", "Sort Code", "BSB"
  routingFormat?: RegExp;
  swiftRequired: boolean;
}

export interface BankingValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// COUNTRY BANKING DATA
// ============================================================================

export const countryBankingData: Record<string, CountryBankingInfo> = {
  // IBAN Countries (Europe, Middle East, etc.)
  DE: { code: 'DE', name: 'Germany', usesIban: true, ibanLength: 22, swiftRequired: true },
  FR: { code: 'FR', name: 'France', usesIban: true, ibanLength: 27, swiftRequired: true },
  GB: { code: 'GB', name: 'United Kingdom', usesIban: true, ibanLength: 22, swiftRequired: true, routingName: 'Sort Code' },
  IT: { code: 'IT', name: 'Italy', usesIban: true, ibanLength: 27, swiftRequired: true },
  ES: { code: 'ES', name: 'Spain', usesIban: true, ibanLength: 24, swiftRequired: true },
  NL: { code: 'NL', name: 'Netherlands', usesIban: true, ibanLength: 18, swiftRequired: true },
  BE: { code: 'BE', name: 'Belgium', usesIban: true, ibanLength: 16, swiftRequired: true },
  AT: { code: 'AT', name: 'Austria', usesIban: true, ibanLength: 20, swiftRequired: true },
  CH: { code: 'CH', name: 'Switzerland', usesIban: true, ibanLength: 21, swiftRequired: true },
  SE: { code: 'SE', name: 'Sweden', usesIban: true, ibanLength: 24, swiftRequired: true },
  NO: { code: 'NO', name: 'Norway', usesIban: true, ibanLength: 15, swiftRequired: true },
  DK: { code: 'DK', name: 'Denmark', usesIban: true, ibanLength: 18, swiftRequired: true },
  FI: { code: 'FI', name: 'Finland', usesIban: true, ibanLength: 18, swiftRequired: true },
  PL: { code: 'PL', name: 'Poland', usesIban: true, ibanLength: 28, swiftRequired: true },
  PT: { code: 'PT', name: 'Portugal', usesIban: true, ibanLength: 25, swiftRequired: true },
  IE: { code: 'IE', name: 'Ireland', usesIban: true, ibanLength: 22, swiftRequired: true },
  GR: { code: 'GR', name: 'Greece', usesIban: true, ibanLength: 27, swiftRequired: true },
  CZ: { code: 'CZ', name: 'Czech Republic', usesIban: true, ibanLength: 24, swiftRequired: true },
  HU: { code: 'HU', name: 'Hungary', usesIban: true, ibanLength: 28, swiftRequired: true },
  RO: { code: 'RO', name: 'Romania', usesIban: true, ibanLength: 24, swiftRequired: true },
  AE: { code: 'AE', name: 'UAE', usesIban: true, ibanLength: 23, swiftRequired: true },
  SA: { code: 'SA', name: 'Saudi Arabia', usesIban: true, ibanLength: 24, swiftRequired: true },
  QA: { code: 'QA', name: 'Qatar', usesIban: true, ibanLength: 29, swiftRequired: true },
  KW: { code: 'KW', name: 'Kuwait', usesIban: true, ibanLength: 30, swiftRequired: true },
  BH: { code: 'BH', name: 'Bahrain', usesIban: true, ibanLength: 22, swiftRequired: true },
  
  // Non-IBAN Countries (Americas, Asia-Pacific, Africa)
  US: { 
    code: 'US', 
    name: 'United States', 
    usesIban: false, 
    routingName: 'Routing Number (ABA)',
    routingFormat: /^\d{9}$/,
    swiftRequired: true 
  },
  CA: { 
    code: 'CA', 
    name: 'Canada', 
    usesIban: false, 
    routingName: 'Transit Number',
    routingFormat: /^\d{5}-\d{3}$|^\d{8,9}$/,
    swiftRequired: true 
  },
  AU: { 
    code: 'AU', 
    name: 'Australia', 
    usesIban: false, 
    routingName: 'BSB Number',
    routingFormat: /^\d{3}-?\d{3}$/,
    swiftRequired: true 
  },
  NZ: { 
    code: 'NZ', 
    name: 'New Zealand', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  JP: { 
    code: 'JP', 
    name: 'Japan', 
    usesIban: false, 
    routingName: 'Bank & Branch Code',
    swiftRequired: true 
  },
  CN: { 
    code: 'CN', 
    name: 'China', 
    usesIban: false, 
    routingName: 'CNAPS Code',
    routingFormat: /^\d{12}$/,
    swiftRequired: true 
  },
  IN: { 
    code: 'IN', 
    name: 'India', 
    usesIban: false, 
    routingName: 'IFSC Code',
    routingFormat: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    swiftRequired: true 
  },
  SG: { 
    code: 'SG', 
    name: 'Singapore', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  HK: { 
    code: 'HK', 
    name: 'Hong Kong', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  KR: { 
    code: 'KR', 
    name: 'South Korea', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  ZA: { 
    code: 'ZA', 
    name: 'South Africa', 
    usesIban: false, 
    routingName: 'Branch Code',
    swiftRequired: true 
  },
  NG: { 
    code: 'NG', 
    name: 'Nigeria', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  KE: { 
    code: 'KE', 
    name: 'Kenya', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  GH: { 
    code: 'GH', 
    name: 'Ghana', 
    usesIban: false, 
    routingName: 'Bank Code',
    swiftRequired: true 
  },
  MX: { 
    code: 'MX', 
    name: 'Mexico', 
    usesIban: false, 
    routingName: 'CLABE',
    routingFormat: /^\d{18}$/,
    swiftRequired: true 
  },
  BR: { 
    code: 'BR', 
    name: 'Brazil', 
    usesIban: false, 
    routingName: 'Bank & Branch Code',
    swiftRequired: true 
  },
  AR: { 
    code: 'AR', 
    name: 'Argentina', 
    usesIban: false, 
    routingName: 'CBU',
    routingFormat: /^\d{22}$/,
    swiftRequired: true 
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if country uses IBAN
 */
export const countryUsesIban = (countryCode: string): boolean => {
  const country = countryBankingData[countryCode.toUpperCase()];
  return country?.usesIban ?? false;
};

/**
 * Get banking info for country
 */
export const getCountryBankingInfo = (countryCode: string): CountryBankingInfo | null => {
  return countryBankingData[countryCode.toUpperCase()] ?? null;
};

/**
 * Get routing number label for country
 */
export const getRoutingLabel = (countryCode: string): string => {
  const country = countryBankingData[countryCode.toUpperCase()];
  if (country?.usesIban) {
    return 'IBAN';
  }
  return country?.routingName ?? 'Routing Number';
};

/**
 * Validate IBAN format
 */
export const validateIban = (iban: string, countryCode?: string): BankingValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Basic format check
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIban)) {
    return { isValid: false, error: 'Invalid IBAN format' };
  }
  
  // Extract country code from IBAN
  const ibanCountry = cleanIban.substring(0, 2);
  const countryInfo = countryBankingData[ibanCountry];
  
  // Check if country uses IBAN
  if (countryInfo && !countryInfo.usesIban) {
    return { isValid: false, error: `${countryInfo.name} does not use IBAN` };
  }
  
  // Check length if country info available
  if (countryInfo?.ibanLength && cleanIban.length !== countryInfo.ibanLength) {
    return { 
      isValid: false, 
      error: `IBAN for ${countryInfo.name} should be ${countryInfo.ibanLength} characters` 
    };
  }
  
  // Validate with country code if provided
  if (countryCode && ibanCountry !== countryCode.toUpperCase()) {
    return { isValid: false, error: 'IBAN country does not match selected country' };
  }
  
  // MOD 97 validation
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
  const numericIban = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  let remainder = numericIban;
  while (remainder.length > 2) {
    const block = remainder.substring(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.substring(block.length);
  }
  
  if (parseInt(remainder, 10) !== 1) {
    return { isValid: false, error: 'Invalid IBAN checksum' };
  }
  
  return { isValid: true };
};

/**
 * Validate SWIFT/BIC code
 */
export const validateSwift = (swift: string): BankingValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanSwift = swift.replace(/\s/g, '').toUpperCase();
  
  // SWIFT format: 4 letters (bank code) + 2 letters (country) + 2 alphanumeric (location) + optional 3 alphanumeric (branch)
  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  
  if (!swiftRegex.test(cleanSwift)) {
    return { 
      isValid: false, 
      error: 'Invalid SWIFT/BIC format. Should be 8 or 11 characters (e.g., DEUTDEFF or DEUTDEFFXXX)' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validate routing number based on country
 */
export const validateRoutingNumber = (
  routingNumber: string, 
  countryCode: string
): BankingValidationResult => {
  const countryInfo = countryBankingData[countryCode.toUpperCase()];
  
  if (!countryInfo) {
    return { isValid: true }; // No validation available for unknown countries
  }
  
  if (countryInfo.usesIban) {
    return { isValid: false, error: `${countryInfo.name} uses IBAN, not routing numbers` };
  }
  
  if (countryInfo.routingFormat && !countryInfo.routingFormat.test(routingNumber)) {
    return { 
      isValid: false, 
      error: `Invalid ${countryInfo.routingName} format for ${countryInfo.name}` 
    };
  }
  
  return { isValid: true };
};

/**
 * Format IBAN for display (add spaces every 4 characters)
 */
export const formatIbanForDisplay = (iban: string): string => {
  return iban.replace(/\s/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Format SWIFT for display
 */
export const formatSwiftForDisplay = (swift: string): string => {
  return swift.replace(/\s/g, '').toUpperCase();
};

/**
 * Get list of IBAN-using countries
 */
export const getIbanCountries = (): CountryBankingInfo[] => {
  return Object.values(countryBankingData).filter(country => country.usesIban);
};

/**
 * Get list of non-IBAN countries
 */
export const getNonIbanCountries = (): CountryBankingInfo[] => {
  return Object.values(countryBankingData).filter(country => !country.usesIban);
};

/**
 * Determine if IBAN or routing should be used based on country
 */
export const getBankingRequirements = (countryCode: string): {
  useIban: boolean;
  routingLabel: string;
  routingRequired: boolean;
  ibanRequired: boolean;
  swiftRequired: boolean;
} => {
  const countryInfo = countryBankingData[countryCode.toUpperCase()];
  
  if (!countryInfo) {
    // Default behavior for unknown countries
    return {
      useIban: false,
      routingLabel: 'Routing Number',
      routingRequired: true,
      ibanRequired: false,
      swiftRequired: true,
    };
  }
  
  return {
    useIban: countryInfo.usesIban,
    routingLabel: countryInfo.routingName || 'Routing Number',
    routingRequired: !countryInfo.usesIban,
    ibanRequired: countryInfo.usesIban,
    swiftRequired: countryInfo.swiftRequired,
  };
};
