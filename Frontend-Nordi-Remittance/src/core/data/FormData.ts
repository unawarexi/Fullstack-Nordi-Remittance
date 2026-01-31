// Define currencies
export const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "SEK", label: "Swedish Krona (SEK)" },
  { value: "NZD", label: "New Zealand Dollar (NZD)" },
];

// Define income ranges
export const incomeRanges = [
  { value: "0-25000", label: "$0 - $25,000" },
  { value: "25001-50000", label: "$25,001 - $50,000" },
  { value: "50001-75000", label: "$50,001 - $75,000" },
  { value: "75001-100000", label: "$75,001 - $100,000" },
  { value: "100001-150000", label: "$100,001 - $150,000" },
  { value: "150001+", label: "$150,001+" },
];

// Define income sources
export const incomeSources = [
  { value: "employment", label: "Employment" },
  { value: "self-employment", label: "Self-Employment" },
  { value: "business", label: "Business" },
  { value: "investment", label: "Investment" },
  { value: "pension", label: "Pension" },
  { value: "inheritance", label: "Inheritance" },
  { value: "other", label: "Other" },
];

// Define employment statuses
export const employmentStatuses = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

// Define ID types
export const idTypes = [
  { value: "passport", label: "Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "national_id", label: "National ID" },
  { value: "residence_permit", label: "Residence Permit" },
];

// Define address document types
export const addressDocTypes = [
  { value: "utility_bill", label: "Utility Bill" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "rental_agreement", label: "Rental Agreement" },
  { value: "tax_bill", label: "Tax Bill" },
  { value: "insurance_policy", label: "Insurance Policy" },
];

// Define security questions
export const securityQuestions = [
  {
    value: "mothers_maiden_name",
    label: "What is your mother's maiden name?",
  },
  { value: "first_pet", label: "What was the name of your first pet?" },
  { value: "birth_city", label: "In which city were you born?" },
  { value: "first_school", label: "What was the name of your first school?" },
  { value: "favorite_movie", label: "What is your favorite movie?" },
];

// Define 2FA methods
export const twoFactorMethods = [
  { value: "SMS", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "authenticator", label: "Authenticator App" },
];

// Define genders
export const genders = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// Define marital statuses
export const maritalStatuses = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
  { value: "other", label: "Other" },
];
