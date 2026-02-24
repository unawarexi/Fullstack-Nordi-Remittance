// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

import { constants } from "../../config/env.config.js";
import type { ValidationResult, ValidationError } from "../../types/index.js";

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function createValidationResult(
  errors: ValidationError[] = [],
): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function addError(
  errors: ValidationError[],
  field: string,
  message: string,
  code: string = "INVALID",
): void {
  errors.push({ field, message, code });
}

// ============================================================================
// STRING VALIDATORS
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Accept various phone formats, including international
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return phoneRegex.test(cleaned);
}

export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < constants.MIN_PASSWORD_LENGTH) {
    errors.push(
      `Password must be at least ${constants.MIN_PASSWORD_LENGTH} characters`,
    );
  }

  if (password.length > constants.MAX_PASSWORD_LENGTH) {
    errors.push(
      `Password must not exceed ${constants.MAX_PASSWORD_LENGTH} characters`,
    );
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[@$!%*?&#^()_+\-=\[\]{}|;:,.<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { isValid: errors.length === 0, errors };
}

export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidAccountNumber(accountNumber: string): boolean {
  const cleaned = accountNumber.replace(/\s/g, "");
  return /^\d{10,12}$/.test(cleaned);
}

export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  // Basic IBAN format check
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(cleaned)) {
    return false;
  }

  // Rearrange and convert to numbers for checksum
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const converted = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString(),
  );

  // MOD 97 check
  let remainder = converted;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
  }

  return parseInt(remainder, 10) % 97 === 1;
}

export function isValidSwiftCode(swift: string): boolean {
  // Relaxed SWIFT/BIC code format: 8 to 11 alphanumeric characters
  const swiftRegex = /^[a-zA-Z0-9]{8,11}$/i;
  return swiftRegex.test(swift.replace(/\s/g, ""));
}

export function isValidRoutingNumber(routingNumber: string): boolean {
  // Relaxed US ABA routing number validation: just check for 9 digits
  const cleaned = routingNumber.replace(/\s/g, "");
  return /^\d{9}$/.test(cleaned);
}

export function isValidCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function isValidCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

export function isValidExpiryDate(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) return false;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

// ============================================================================
// NUMBER VALIDATORS
// ============================================================================

export function isValidAmount(amount: number): boolean {
  return (
    typeof amount === "number" &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount >= constants.MIN_TRANSACTION_AMOUNT &&
    amount <= constants.MAX_TRANSACTION_AMOUNT
  );
}

export function isValidCurrency(currency: string): boolean {
  return constants.SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}

// ============================================================================
// DATE VALIDATORS
// ============================================================================

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidDateOfBirth(dateString: string): boolean {
  if (!isValidDate(dateString)) return false;

  const dob = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 18 && age <= 120;
}

export function isFutureDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false;
  return new Date(dateString) > new Date();
}

export function isPastDate(dateString: string): boolean {
  if (!isValidDate(dateString)) return false;
  return new Date(dateString) < new Date();
}

// ============================================================================
// OBJECT VALIDATORS
// ============================================================================

export function hasRequiredFields<T extends object>(
  obj: T,
  requiredFields: (keyof T)[],
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = obj[field];
    if (value === undefined || value === null || value === "") {
      missingFields.push(String(field));
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// ============================================================================
// SANITIZATION
// ============================================================================

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/[\x00-\x1f\x7f]/g, ""); // Remove control characters
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizePhone(phone: string): string {
  // Keep only digits and leading +
  return phone.replace(/[^\d+]/g, "");
}

export function normalizeAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/\s/g, "");
}

export function normalizeCardNumber(cardNumber: string): string {
  return cardNumber.replace(/\s/g, "");
}

// ============================================================================
// COMPREHENSIVE VALIDATORS
// ============================================================================

export function validateRegistrationData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Required string fields
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "mobileNumber",
    "dateOfBirth",
    "gender",
    "nationality",
    "countryOfResidence",
    "idType",
    "idNumber",
    "idExpiryDate",
    "homeAddress",
    "city",
    "stateProvince",
    "zipCode",
    "country",
    "accountType",
    "currency",
    "sourceOfIncome",
    "monthlyIncomeRange",
    "employmentStatus",
    "occupation",
    "accountName",
    "bankName",
    "bankAddress",
    "swiftBic",
    "securityQuestion",
    "securityAnswer",
    "addressDocType",
    "taxIdentificationNumber",
  ];

  for (const field of requiredFields) {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      addError(errors, field, `${field} is required`, "REQUIRED");
    }
  }

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email format", "INVALID_FORMAT");
  }

  // Password validation
  if (data.password) {
    const passwordValidation = isValidPassword(data.password);
    if (!passwordValidation.isValid) {
      for (const error of passwordValidation.errors) {
        addError(errors, "password", error, "WEAK_PASSWORD");
      }
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      addError(errors, "confirmPassword", "Passwords do not match", "MISMATCH");
    }
  }

  // Phone validation
  if (data.mobileNumber && !isValidPhone(data.mobileNumber)) {
    addError(
      errors,
      "mobileNumber",
      "Invalid phone number format",
      "INVALID_FORMAT",
    );
  }

  // Date of birth validation
  if (data.dateOfBirth && !isValidDateOfBirth(data.dateOfBirth)) {
    addError(
      errors,
      "dateOfBirth",
      "Invalid date of birth. Must be 18 years or older.",
      "INVALID_DATE",
    );
  }

  // ID expiry date validation
  if (data.idExpiryDate && !isFutureDate(data.idExpiryDate)) {
    addError(errors, "idExpiryDate", "ID must not be expired", "EXPIRED");
  }

  // Currency validation
  if (data.currency && !isValidCurrency(data.currency)) {
    addError(
      errors,
      "currency",
      "Invalid or unsupported currency",
      "INVALID_CURRENCY",
    );
  }

  // Initial deposit validation
  if (data.initialDeposit !== undefined) {
    const deposit = parseFloat(data.initialDeposit);
    if (isNaN(deposit) || deposit < 0) {
      addError(
        errors,
        "initialDeposit",
        "Initial deposit must be a positive number",
        "INVALID_AMOUNT",
      );
    }
  }

  // IBAN or Routing number validation
  // if (!data.ibanNumber && !data.routingNumber) {
  //   addError(
  //     errors,
  //     "ibanNumber",
  //     "Either IBAN or routing number is required",
  //     "REQUIRED",
  //   );
  // }

  // if (data.ibanNumber && !isValidIBAN(data.ibanNumber)) {
  //   addError(errors, "ibanNumber", "Invalid IBAN format", "INVALID_FORMAT");
  // }

  // if (data.routingNumber && !isValidRoutingNumber(data.routingNumber)) {
  //   addError(
  //     errors,
  //     "routingNumber",
  //     "Invalid routing number",
  //     "INVALID_FORMAT",
  //   );
  // }

  // // SWIFT code validation
  // if (data.swiftBic && !isValidSwiftCode(data.swiftBic)) {
  //   addError(errors, "swiftBic", "Invalid SWIFT/BIC code", "INVALID_FORMAT");
  // }

  // Terms agreement validation
  if (!data.agreeToTerms) {
    addError(
      errors,
      "agreeToTerms",
      "You must agree to the terms of service",
      "REQUIRED",
    );
  }

  if (!data.agreeToPrivacy) {
    addError(
      errors,
      "agreeToPrivacy",
      "You must agree to the privacy policy",
      "REQUIRED",
    );
  }

  return createValidationResult(errors);
}

export function validateLoginData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.email || !data.email.trim()) {
    addError(errors, "email", "Email is required", "REQUIRED");
  } else if (!isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email format", "INVALID_FORMAT");
  }

  if (!data.password || !data.password.trim()) {
    addError(errors, "password", "Password is required", "REQUIRED");
  }

  return createValidationResult(errors);
}

export function validateTransactionData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.amount || !isValidAmount(parseFloat(data.amount))) {
    addError(errors, "amount", "Invalid transaction amount", "INVALID_AMOUNT");
  }

  if (!data.currency || !isValidCurrency(data.currency)) {
    addError(
      errors,
      "currency",
      "Invalid or unsupported currency",
      "INVALID_CURRENCY",
    );
  }

  if (!data.type) {
    addError(errors, "type", "Transaction type is required", "REQUIRED");
  }

  return createValidationResult(errors);
}

export function validateTransferData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.amount || !isValidAmount(parseFloat(data.amount))) {
    addError(errors, "amount", "Invalid transfer amount", "INVALID_AMOUNT");
  }

  if (!data.currency || !isValidCurrency(data.currency)) {
    addError(
      errors,
      "currency",
      "Invalid or unsupported currency",
      "INVALID_CURRENCY",
    );
  }

  // Must have either recipient wallet or external account
  if (!data.toWalletId && !data.toAccountNumber) {
    addError(
      errors,
      "recipient",
      "Recipient wallet ID or account number is required",
      "REQUIRED",
    );
  }

  if (data.toAccountNumber) {
    if (!data.toBankName) {
      addError(
        errors,
        "toBankName",
        "Recipient bank name is required for external transfers",
        "REQUIRED",
      );
    }
    if (!data.toAccountName) {
      addError(
        errors,
        "toAccountName",
        "Recipient account name is required for external transfers",
        "REQUIRED",
      );
    }
  }

  return createValidationResult(errors);
}

export default {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUUID,
  isValidAccountNumber,
  isValidIBAN,
  isValidSwiftCode,
  isValidRoutingNumber,
  isValidCardNumber,
  isValidCVV,
  isValidExpiryDate,
  isValidAmount,
  isValidCurrency,
  isValidDate,
  isValidDateOfBirth,
  isFutureDate,
  isPastDate,
  hasRequiredFields,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  normalizeAccountNumber,
  normalizeCardNumber,
  validateRegistrationData,
  validateLoginData,
  validateTransactionData,
  validateTransferData,
};
