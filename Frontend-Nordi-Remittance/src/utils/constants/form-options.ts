// ============================================================================
// FORM OPTIONS - Select options for signup form
// ============================================================================

// ============================================================================
// GENDER OPTIONS
// ============================================================================

export const genderOptions: SelectOption[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

// ============================================================================
// MARITAL STATUS OPTIONS
// ============================================================================

export const maritalStatusOptions: SelectOption[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated" },
  { value: "domestic_partnership", label: "Domestic Partnership" },
];

// ============================================================================
// ID TYPE OPTIONS
// ============================================================================

export const idTypeOptions: SelectOption[] = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "residence_permit", label: "Residence Permit" },
  { value: "voter_id", label: "Voter ID" },
];

// ============================================================================
// ADDRESS DOCUMENT TYPE OPTIONS
// ============================================================================

export const addressDocTypeOptions: SelectOption[] = [
  { value: "utility_bill", label: "Utility Bill (within 3 months)" },
  { value: "bank_statement", label: "Bank Statement (within 3 months)" },
  { value: "tax_document", label: "Tax Document" },
  { value: "government_letter", label: "Government Letter" },
  { value: "rental_agreement", label: "Rental/Lease Agreement" },
];

// ============================================================================
// ACCOUNT TYPE OPTIONS
// ============================================================================

export const accountTypeOptions: SelectOption[] = [
  { value: "savings", label: "Savings Account" },
  { value: "checking", label: "Checking Account" },
  { value: "business", label: "Business Account" },
  { value: "joint", label: "Joint Account" },
  { value: "student", label: "Student Account" },
  { value: "premium", label: "Premium Account" },
];

// ============================================================================
// CURRENCY OPTIONS
// ============================================================================

export const currencyOptions: SelectOption[] = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "SEK", label: "Swedish Krona (SEK)" },
  { value: "NOK", label: "Norwegian Krone (NOK)" },
  { value: "DKK", label: "Danish Krone (DKK)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "KES", label: "Kenyan Shilling (KES)" },
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
];

// ============================================================================
// SOURCE OF INCOME OPTIONS
// ============================================================================

export const sourceOfIncomeOptions: SelectOption[] = [
  { value: "salary", label: "Salary/Employment" },
  { value: "business", label: "Business Income" },
  { value: "investments", label: "Investments" },
  { value: "rental", label: "Rental Income" },
  { value: "pension", label: "Pension" },
  { value: "inheritance", label: "Inheritance" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
];

// ============================================================================
// MONTHLY INCOME RANGE OPTIONS
// ============================================================================

export const monthlyIncomeRangeOptions: SelectOption[] = [
  { value: "under_1000", label: "Under $1,000" },
  { value: "1000_3000", label: "$1,000 - $3,000" },
  { value: "3000_5000", label: "$3,000 - $5,000" },
  { value: "5000_10000", label: "$5,000 - $10,000" },
  { value: "10000_25000", label: "$10,000 - $25,000" },
  { value: "25000_50000", label: "$25,000 - $50,000" },
  { value: "50000_100000", label: "$50,000 - $100,000" },
  { value: "over_100000", label: "Over $100,000" },
];

// ============================================================================
// EMPLOYMENT STATUS OPTIONS
// ============================================================================

export const employmentStatusOptions: SelectOption[] = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "homemaker", label: "Homemaker" },
];

// ============================================================================
// SECURITY QUESTION OPTIONS
// ============================================================================

export const securityQuestionOptions: SelectOption[] = [
  { value: "mothers_maiden", label: "What is your mother's maiden name?" },
  { value: "first_pet", label: "What was the name of your first pet?" },
  { value: "birth_city", label: "In what city were you born?" },
  { value: "first_school", label: "What was the name of your first school?" },
  {
    value: "childhood_friend",
    label: "What is your childhood best friend's name?",
  },
  { value: "favorite_book", label: "What is your favorite book?" },
  { value: "first_car", label: "What was the make of your first car?" },
  { value: "street_name", label: "What street did you grow up on?" },
];

// ============================================================================
// TWO FACTOR METHOD OPTIONS
// ============================================================================

export const twoFactorMethodOptions: SelectOption[] = [
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "authenticator", label: "Authenticator App" },
];
