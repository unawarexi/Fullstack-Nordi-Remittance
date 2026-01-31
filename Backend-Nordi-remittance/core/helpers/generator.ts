// ============================================================================
// GENERATOR UTILITIES
// ============================================================================

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { constants } from '../../config/env.config.js';

// ============================================================================
// ACCOUNT AND WALLET NUMBERS
// ============================================================================

/**
 * Generate a random account number with specified length
 */
export function generateAccountNumber(length: number = constants.ACCOUNT_NUMBER_LENGTH): string {
  let account = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    account += (randomBytes[i] % 10).toString();
  }
  // Ensure first digit is not 0
  if (account[0] === '0') {
    account = (Math.floor(Math.random() * 9) + 1).toString() + account.slice(1);
  }
  return account;
}

/**
 * Generate a wallet number with prefix
 */
export function generateWalletNumber(prefix: string = 'W'): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// ============================================================================
// REFERENCE NUMBERS
// ============================================================================

/**
 * Generate a unique transaction reference number
 */
export function generateReferenceNumber(type: string = 'TXN'): string {
  const prefix = type.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Generate a loan reference number
 */
export function generateLoanReference(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `LN${year}${month}-${random}`;
}

/**
 * Generate a card reference number
 */
export function generateCardReference(): string {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `CRD-${random}`;
}

/**
 * Generate a ticket reference number
 */
export function generateTicketReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TKT-${timestamp}${random}`;
}

// ============================================================================
// CARD NUMBERS
// ============================================================================

/**
 * Generate a valid card number using Luhn algorithm
 */
export function generateCardNumber(prefix: string = '4'): string {
  // Start with prefix (4 for Visa, 5 for Mastercard)
  let cardNumber = prefix;
  
  // Generate remaining digits (except checksum)
  const remainingLength = 15 - prefix.length;
  const randomBytes = crypto.randomBytes(remainingLength);
  for (let i = 0; i < remainingLength; i++) {
    cardNumber += (randomBytes[i] % 10).toString();
  }
  
  // Calculate Luhn checksum
  let sum = 0;
  let isEven = true;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return cardNumber + checksum.toString();
}

/**
 * Generate a CVV code
 */
export function generateCVV(length: number = 3): string {
  let cvv = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    cvv += (randomBytes[i] % 10).toString();
  }
  return cvv;
}

/**
 * Generate card PIN
 */
export function generatePIN(length: number = 4): string {
  let pin = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pin += (randomBytes[i] % 10).toString();
  }
  return pin;
}

// ============================================================================
// IDENTIFIERS
// ============================================================================

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return uuidv4();
}

/**
 * Generate a short unique ID
 */
export function generateShortId(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    id += chars[randomBytes[i] % chars.length];
  }
  return id;
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return `sess_${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Generate a device ID
 */
export function generateDeviceId(): string {
  return `dev_${crypto.randomBytes(12).toString('hex')}`;
}

// ============================================================================
// IBAN GENERATION (for demo purposes)
// ============================================================================

/**
 * Generate a demo IBAN number
 */
export function generateIBAN(countryCode: string = 'DE'): string {
  // This generates a structurally valid but not real IBAN
  const bankCode = crypto.randomBytes(4).toString('hex').substring(0, 8).toUpperCase();
  const accountNumber = generateAccountNumber(10);
  
  // Calculate check digits (simplified)
  const rearranged = bankCode + accountNumber + countryCode + '00';
  let numericString = '';
  
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }
  
  // Calculate MOD 97 check digits
  let remainder = numericString;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
  }
  
  const checkDigits = (98 - (parseInt(remainder, 10) % 97)).toString().padStart(2, '0');
  
  return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
}

// ============================================================================
// DATE/TIME HELPERS
// ============================================================================

/**
 * Generate expiry date for cards (years from now)
 */
export function generateCardExpiry(yearsFromNow: number = 3): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear() + yearsFromNow,
  };
}

/**
 * Generate a timestamp-based filename
 */
export function generateFilename(extension: string, prefix: string = 'file'): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${random}.${extension}`;
}

export default {
  generateAccountNumber,
  generateWalletNumber,
  generateReferenceNumber,
  generateLoanReference,
  generateCardReference,
  generateTicketReference,
  generateCardNumber,
  generateCVV,
  generatePIN,
  generateUUID,
  generateShortId,
  generateSessionId,
  generateDeviceId,
  generateIBAN,
  generateCardExpiry,
  generateFilename,
};