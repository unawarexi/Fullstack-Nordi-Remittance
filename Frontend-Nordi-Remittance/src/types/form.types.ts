// ============================================================================
// FORM TYPES - Types for form components and validation
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// FORM FIELD TYPES
// ============================================================================

export interface FormFieldBase {
  name: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export interface TextFieldProps extends FormFieldBase {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface NumberFieldProps extends FormFieldBase {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowNegative?: boolean;
  format?: (value: number) => string;
  parse?: (value: string) => number;
}

export interface TextAreaFieldProps extends FormFieldBase {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  rows?: number;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
}

export interface SelectFieldProps<T = string> extends FormFieldBase {
  options: SelectFieldOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isLoading?: boolean;
}

export interface SelectFieldOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
  group?: string;
}

export interface CheckboxFieldProps extends FormFieldBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

export interface RadioFieldProps extends FormFieldBase {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface SwitchFieldProps extends FormFieldBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export interface DateFieldProps extends FormFieldBase {
  value?: Date | string;
  defaultValue?: Date | string;
  onChange?: (value: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
}

export interface DateRangeFieldProps extends FormFieldBase {
  value?: [Date | null, Date | null];
  defaultValue?: [Date | null, Date | null];
  onChange?: (value: [Date | null, Date | null]) => void;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

export interface FileFieldProps extends FormFieldBase {
  value?: File | File[];
  onChange?: (files: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  showPreview?: boolean;
}

export interface SliderFieldProps extends FormFieldBase {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  marks?: SliderMark[];
}

export interface SliderMark {
  value: number;
  label?: string;
}

export interface RangeSliderFieldProps extends Omit<SliderFieldProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: [number, number];
  defaultValue?: [number, number];
  onChange?: (value: [number, number]) => void;
}

// ============================================================================
// FORM CONTAINER TYPES
// ============================================================================

export interface FormProps<T = Record<string, unknown>> {
  children: ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  validationSchema?: unknown; // Zod, Yup, etc.
  mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'all';
  className?: string;
}

export interface FormGroupProps {
  children: ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
  className?: string;
}

export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: unknown;
  message: string;
}

export interface FieldValidation {
  rules: ValidationRule[];
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export interface FormError {
  field: string;
  message: string;
  type?: string;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// ============================================================================
// SPECIALIZED FORM TYPES
// ============================================================================

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Note: Full SignupFormValues is defined in auth.types.ts for the KYC registration flow
export interface BasicSignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: File | string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface AddressFormValues {
  street: string;
  unit?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface BankAccountFormValues {
  bankName: string;
  accountNumber: string;
  accountName: string;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency: string;
}

export interface TransferFormValues {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  description?: string;
  scheduledDate?: string;
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ============================================================================
// FORM WIZARD TYPES
// ============================================================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: ReactNode;
  isOptional?: boolean;
  validationSchema?: unknown;
}

export interface WizardProps<T = Record<string, unknown>> {
  steps: WizardStep[];
  initialStep?: number;
  initialData?: Partial<T>;
  onComplete: (data: T) => void | Promise<void>;
  onStepChange?: (step: number, data: Partial<T>) => void;
  showStepNumbers?: boolean;
  showNavigation?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export interface WizardState<T = Record<string, unknown>> {
  currentStep: number;
  data: Partial<T>;
  completedSteps: number[];
  isSubmitting: boolean;
}

// ============================================================================
// OTP/VERIFICATION FORM TYPES
// ============================================================================

export interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  autoFocus?: boolean;
  type?: 'text' | 'number';
  mask?: boolean;
  className?: string;
}

export interface PinInputProps extends OTPInputProps {
  mask?: boolean;
}

// ============================================================================
// SEARCH FORM TYPES
// ============================================================================

export interface SearchFormProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  showClear?: boolean;
  suggestions?: SearchSuggestion[];
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  className?: string;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  href?: string;
  category?: string;
}

// ============================================================================
// FILTER FORM TYPES
// ============================================================================

export interface FilterOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range' | 'date';
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
}

export interface FilterFormProps {
  filters: FilterOption[];
  values?: Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onApply?: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  showApplyButton?: boolean;
  showResetButton?: boolean;
  className?: string;
}
