// ============================================================================
// FORM TYPES - Types for form components and validation
// ============================================================================

import { ReactNode } from 'react';

// ============================================================================
// FORM FIELD TYPES
// ============================================================================
// ============================================================================
// FORM CONTAINER TYPES
// ============================================================================
// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================
// ============================================================================
// SPECIALIZED FORM TYPES
// ============================================================================
// Note: Full SignupFormValues is defined in auth.types.ts for the KYC registration flow
// ============================================================================
// FORM WIZARD TYPES
// ============================================================================
// ============================================================================
// OTP/VERIFICATION FORM TYPES
// ============================================================================
// ============================================================================
// SEARCH FORM TYPES
// ============================================================================
// ============================================================================
// FILTER FORM TYPES
// ============================================================================

declare global {
    interface FormFieldBase {
        name: string;
        label?: string;
        placeholder?: string;
        hint?: string;
        error?: string;
        isRequired?: boolean;
        isDisabled?: boolean;
        isReadOnly?: boolean;
    }

    interface TextFieldProps extends FormFieldBase {
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

    interface NumberFieldProps extends FormFieldBase {
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

    interface TextAreaFieldProps extends FormFieldBase {
        value?: string;
        defaultValue?: string;
        onChange?: (value: string) => void;
        rows?: number;
        maxLength?: number;
        resize?: 'none' | 'vertical' | 'horizontal' | 'both';
        autoResize?: boolean;
    }

    interface SelectFieldProps<T = string> extends FormFieldBase {
        options: SelectFieldOption<T>[];
        value?: T;
        defaultValue?: T;
        onChange?: (value: T) => void;
        isMulti?: boolean;
        isSearchable?: boolean;
        isClearable?: boolean;
        isLoading?: boolean;
    }

    interface SelectFieldOption<T = string> {
        label: string;
        value: T;
        disabled?: boolean;
        icon?: ReactNode;
        group?: string;
    }

    interface CheckboxFieldProps extends FormFieldBase {
        checked?: boolean;
        defaultChecked?: boolean;
        onChange?: (checked: boolean) => void;
        indeterminate?: boolean;
    }

    interface RadioFieldProps extends FormFieldBase {
        options: RadioOption[];
        value?: string;
        defaultValue?: string;
        onChange?: (value: string) => void;
        orientation?: 'horizontal' | 'vertical';
    }

    interface RadioOption {
        label: string;
        value: string;
        disabled?: boolean;
        description?: string;
    }

    interface SwitchFieldProps extends FormFieldBase {
        checked?: boolean;
        defaultChecked?: boolean;
        onChange?: (checked: boolean) => void;
    }

    interface DateFieldProps extends FormFieldBase {
        value?: Date | string;
        defaultValue?: Date | string;
        onChange?: (value: Date | null) => void;
        minDate?: Date;
        maxDate?: Date;
        format?: string;
        showTime?: boolean;
        timeFormat?: '12h' | '24h';
    }

    interface DateRangeFieldProps extends FormFieldBase {
        value?: [Date | null, Date | null];
        defaultValue?: [Date | null, Date | null];
        onChange?: (value: [Date | null, Date | null]) => void;
        minDate?: Date;
        maxDate?: Date;
        format?: string;
    }

    interface FileFieldProps extends FormFieldBase {
        value?: File | File[];
        onChange?: (files: File | File[] | null) => void;
        accept?: string;
        multiple?: boolean;
        maxSize?: number;
        maxFiles?: number;
        showPreview?: boolean;
    }

    interface SliderFieldProps extends FormFieldBase {
        value?: number;
        defaultValue?: number;
        onChange?: (value: number) => void;
        min?: number;
        max?: number;
        step?: number;
        showValue?: boolean;
        marks?: SliderMark[];
    }

    interface SliderMark {
        value: number;
        label?: string;
    }

    interface RangeSliderFieldProps extends Omit<SliderFieldProps, 'value' | 'defaultValue' | 'onChange'> {
        value?: [number, number];
        defaultValue?: [number, number];
        onChange?: (value: [number, number]) => void;
    }

    interface FormProps<T = Record<string, unknown>> {
        children: ReactNode;
        onSubmit: (data: T) => void | Promise<void>;
        defaultValues?: Partial<T>;
        validationSchema?: unknown;
        mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'all';
        className?: string;
    }

    interface FormGroupProps {
        children: ReactNode;
        label?: string;
        error?: string;
        hint?: string;
        isRequired?: boolean;
        className?: string;
    }

    interface FormSectionProps {
        children: ReactNode;
        title?: string;
        description?: string;
        className?: string;
    }

    interface FormActionsProps {
        children: ReactNode;
        align?: 'left' | 'center' | 'right' | 'between';
        className?: string;
    }

    interface ValidationRule {
        type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
        value?: unknown;
        message: string;
    }

    interface FieldValidation {
        rules: ValidationRule[];
        validateOnBlur?: boolean;
        validateOnChange?: boolean;
    }

    interface FormError {
        field: string;
        message: string;
        type?: string;
    }

    interface FormState<T = Record<string, unknown>> {
        values: T;
        errors: Record<string, string>;
        touched: Record<string, boolean>;
        isSubmitting: boolean;
        isValid: boolean;
        isDirty: boolean;
    }

    interface LoginFormValues {
        email: string;
        password: string;
        rememberMe?: boolean;
    }

    interface BasicSignupFormValues {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
        confirmPassword: string;
        acceptTerms: boolean;
    }

    interface ForgotPasswordFormValues {
        email: string;
    }

    interface ResetPasswordFormValues {
        password: string;
        confirmPassword: string;
        token: string;
    }

    interface ProfileFormValues {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        avatar?: File | string;
        dateOfBirth?: string;
        gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    }

    interface AddressFormValues {
        street: string;
        unit?: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
    }

    interface BankAccountFormValues {
        bankName: string;
        accountNumber: string;
        accountName: string;
        routingNumber?: string;
        swiftCode?: string;
        iban?: string;
        currency: string;
    }

    interface TransferFormValues {
        fromAccount: string;
        toAccount: string;
        amount: number;
        currency: string;
        description?: string;
        scheduledDate?: string;
    }

    interface ContactFormValues {
        name: string;
        email: string;
        phone?: string;
        subject: string;
        message: string;
    }

    interface WizardStep {
        id: string;
        title: string;
        description?: string;
        component: ReactNode;
        isOptional?: boolean;
        validationSchema?: unknown;
    }

    interface WizardProps<T = Record<string, unknown>> {
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

    interface WizardState<T = Record<string, unknown>> {
        currentStep: number;
        data: Partial<T>;
        completedSteps: number[];
        isSubmitting: boolean;
    }

    interface OTPInputProps {
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

    interface PinInputProps extends OTPInputProps {
        mask?: boolean;
    }

    interface SearchFormProps {
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

    interface SearchSuggestion {
        id: string;
        label: string;
        description?: string;
        icon?: ReactNode;
        href?: string;
        category?: string;
    }

    interface FilterOption {
        id: string;
        label: string;
        type: 'checkbox' | 'radio' | 'select' | 'range' | 'date';
        options?: Array<{ label: string; value: string }>;
        min?: number;
        max?: number;
    }

    interface FilterFormProps {
        filters: FilterOption[];
        values?: Record<string, unknown>;
        onChange?: (values: Record<string, unknown>) => void;
        onApply?: (values: Record<string, unknown>) => void;
        onReset?: () => void;
        showApplyButton?: boolean;
        showResetButton?: boolean;
        className?: string;
    }
}
export {};
