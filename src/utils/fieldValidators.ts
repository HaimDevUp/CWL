import { z } from 'zod';

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates if a required field is not empty
 */
export function validateRequired(value: string | boolean, label: string): ValidationResult {
    if (!value || (typeof value === 'string' && !value.trim()) || (typeof value === 'boolean' && !value)) {
        return {
            isValid: false,
            error: `${label} is required`,
        };
    }
    return { isValid: true };
}

/**
 * Validates email format
 */
export function validateEmail(value: string, label: string = 'Email'): ValidationResult {
    if (!value || !value.trim()) {
        return { isValid: true }; // Empty is handled by validateRequired
    }
    
    const result = z.string().email().safeParse(value);
    if (result.error) {
        return {
            isValid: false,
            error: 'Please enter a valid email address',
        };
    }
    return { isValid: true };
}

export const updateNumericField = (value: string | number, maxLength: number, setData: (value: string) => void) => (value: string) => {
    const numericOnly = value.replace(/\D/g, '');
    const limitedValue = numericOnly.slice(0, maxLength);
    setData(limitedValue);
};


/**
 * Validates string length (max characters)
 */
export function validateMaxLength(value: string, maxLength: number, label: string): ValidationResult {
    if (!value || !value.trim()) {
        return { isValid: true }; // Empty is handled by validateRequired
    }
    
    if (value.trim().length > maxLength) {
        return {
            isValid: false,
            error: `${label} must be ${maxLength} characters or less`,
        };
    }
    return { isValid: true };
}

/**
 * Validates digits with optional length constraints
 * @param value - The value to validate
 * @param label - Field label for error messages
 * @param options - Validation options:
 *   - exactLength: Exact number of digits required (e.g., 9 for driver's license)
 *   - minLength: Minimum number of digits
 *   - maxLength: Maximum number of digits
 *   - lengthRange: Array with [min, max] for range (e.g., [5, 10])
 */
export function validateDigits(
    value: string,
    label: string,
    options?: {
        exactLength?: number;
        minLength?: number;
        maxLength?: number;
        lengthRange?: [number, number];
    }
): ValidationResult {
    if (!value || !value.trim()) {
        return { isValid: true }; // Empty is handled by validateRequired
    }
    
    const trimmedValue = value.trim();
    
    // First check if it's only digits
    const digitsOnlyResult = z.string().regex(/^\d+$/).safeParse(trimmedValue);
    if (digitsOnlyResult.error) {
        return {
            isValid: false,
            error: `${label} must be only digits`,
        };
    }
    const length = trimmedValue.length;
    
    // Check exact length
    if (options?.exactLength !== undefined) {
        if (length !== options.exactLength) {
            return {
                isValid: false,
                error: `${label} must be exactly ${options.exactLength} digits`,
            };
        }
    }
    
    // Check length range
    if (options?.lengthRange) {
        const [min, max] = options.lengthRange;
        if (length < min || length > max) {
            return {
                isValid: false,
                error: `${label} must be between ${min} and ${max} digits`,
            };
        }
    }
    // Check min length
    if (options?.minLength !== undefined && length < options.minLength) {
        return {
            isValid: false,
            error: `${label} must be at least ${options.minLength} digits`,
        };
    }
    // Check max length
    if (options?.maxLength !== undefined && length > options.maxLength) {
        return {
            isValid: false,
            error: `${label} must be at most ${options.maxLength} digits`,
        };
    }
    return { isValid: true };
}

/**
 * Validates a field with optional requirement
 * If field is not required and empty, returns valid
 * If field is required and empty, returns error
 * If field has value, runs custom validator
 */
export function validateOptionalField(
    value: string,
    isRequired: boolean,
    label: string,
    customValidator?: (value: string, label: string) => ValidationResult
): ValidationResult {
    const trimmedValue = value?.trim() || '';
    
    // If empty and not required, it's valid
    if (!trimmedValue && !isRequired) {
        return { isValid: true };
    }
    
    // If empty and required, it's invalid
    if (!trimmedValue && isRequired) {
        return {
            isValid: false,
            error: `${label} is required`,
        };
    }
    
    // If has value and custom validator provided, use it
    if (trimmedValue && customValidator) {
        return customValidator(trimmedValue, label);
    }
    
    // If has value and no custom validator, it's valid
    return { isValid: true };
}



