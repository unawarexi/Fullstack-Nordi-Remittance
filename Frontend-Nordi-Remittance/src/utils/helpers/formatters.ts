// ============================================================================
// FORMATTERS - Utility functions for data formatting
// ============================================================================

/**
 * Format phone number with country code
 */
export const formatPhoneNumber = (phone: string, countryCode?: string): string => {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If no country code and doesn't start with +, add default
  if (countryCode && !cleaned.startsWith('+')) {
    return `${countryCode}${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format currency amount in compact form (e.g., 1.2M, 500K)
 */
export const formatCurrencyCompact = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
};

/**
 * Format number with separators
 */
export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 2
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

/**
 * Capitalize first letter of string
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in string
 */
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str.split(' ').map(capitalizeFirst).join(' ');
};

/**
 * Format name (first letter uppercase, rest lowercase)
 */
export const formatName = (name: string): string => {
  if (!name) return '';
  return name
    .split(/[\s-]/)
    .map((part) => capitalizeFirst(part))
    .join(' ');
};

/**
 * Format account number with masking (show last 4 digits)
 */
export const formatAccountNumber = (
  accountNumber: string,
  showLastDigits: number = 4
): string => {
  if (!accountNumber || accountNumber.length <= showLastDigits) {
    return accountNumber;
  }
  const masked = '*'.repeat(accountNumber.length - showLastDigits);
  const visible = accountNumber.slice(-showLastDigits);
  return `${masked}${visible}`;
};

/**
 * Format IBAN with spaces every 4 characters
 */
export const formatIBAN = (iban: string): string => {
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Format credit card number with spaces
 */
export const formatCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Format address into single line
 */
export const formatAddressSingleLine = (
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }
): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Format ID type for display
 */
export const formatIdType = (idType: string): string => {
  const idTypeMap: Record<string, string> = {
    passport: 'Passport',
    national_id: 'National ID Card',
    drivers_license: "Driver's License",
    residence_permit: 'Residence Permit',
    voter_id: 'Voter ID',
  };
  return idTypeMap[idType] || capitalizeWords(idType.replace(/_/g, ' '));
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
    verified: 'Verified',
    unverified: 'Unverified',
    pending_verification: 'Pending Verification',
  };
  return statusMap[status] || capitalizeWords(status.replace(/_/g, ' '));
};
