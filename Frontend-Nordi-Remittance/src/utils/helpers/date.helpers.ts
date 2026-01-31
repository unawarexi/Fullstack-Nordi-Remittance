// ============================================================================
// DATE HELPERS - Date formatting and manipulation utilities
// ============================================================================

/**
 * Format date to locale string
 */
export const formatDate = (
  date: Date | string | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return dateObj.toLocaleDateString(locale, defaultOptions);
};

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export const formatDateDisplay = (date: Date | string | number): string => {
  return formatDate(date, 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for form inputs (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Format date for API (ISO 8601)
 */
export const formatDateForApi = (date: Date | string | number): string => {
  return new Date(date).toISOString();
};

/**
 * Format date with time
 */
export const formatDateTime = (
  date: Date | string | number,
  locale: string = 'en-US'
): string => {
  return formatDate(date, locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (
  date: Date | string | number,
  locale: string = 'en-US',
  hour12: boolean = true
): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  });
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  const dateObj = new Date(date);
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffYear) >= 1) {
    return rtf.format(diffYear, 'year');
  }
  if (Math.abs(diffMonth) >= 1) {
    return rtf.format(diffMonth, 'month');
  }
  if (Math.abs(diffDay) >= 1) {
    return rtf.format(diffDay, 'day');
  }
  if (Math.abs(diffHour) >= 1) {
    return rtf.format(diffHour, 'hour');
  }
  if (Math.abs(diffMin) >= 1) {
    return rtf.format(diffMin, 'minute');
  }
  return rtf.format(diffSec, 'second');
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (birthDate: Date | string | number): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if date is in the past
 */
export const isDateInPast = (date: Date | string | number): boolean => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
export const isDateInFuture = (date: Date | string | number): boolean => {
  return new Date(date) > new Date();
};

/**
 * Check if user is at least minimum age
 */
export const isMinimumAge = (
  birthDate: Date | string | number,
  minAge: number
): boolean => {
  return calculateAge(birthDate) >= minAge;
};

/**
 * Get today's date at midnight
 */
export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get maximum date for date of birth (18 years ago)
 */
export const getMaxDateOfBirth = (minAge: number = 18): Date => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date;
};

/**
 * Get minimum date for ID expiry (today)
 */
export const getMinExpiryDate = (): Date => {
  return getToday();
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add months to a date
 */
export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * Add years to a date
 */
export const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// ============================================================================
// DATE PICKER CONFIGURATIONS
// ============================================================================

export const datePickerConfig = {
  dateOfBirth: {
    maxDate: getMaxDateOfBirth(18),
    showYearDropdown: true,
    scrollableYearDropdown: true,
    yearDropdownItemNumber: 100,
    dropdownMode: 'select' as const,
    dateFormat: 'dd/MM/yyyy',
    placeholderText: 'Select date of birth',
  },
  idExpiry: {
    minDate: getToday(),
    showYearDropdown: true,
    yearDropdownItemNumber: 20,
    dateFormat: 'dd/MM/yyyy',
    placeholderText: 'Select expiry date',
  },
  general: {
    dateFormat: 'dd/MM/yyyy',
    showYearDropdown: true,
    showMonthDropdown: true,
    dropdownMode: 'select' as const,
  },
};
