// src/utils/validation.ts

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => {
      if (typeof value === 'string') return value.length >= min;
      if (Array.isArray(value)) return value.length >= min;
      return false;
    },
    message: message || `Minimum ${min} characters required`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => {
      if (typeof value === 'string') return value.length <= max;
      if (Array.isArray(value)) return value.length <= max;
      return false;
    },
    message: message || `Maximum ${max} characters allowed`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => regex.test(value),
    message,
  }),

  match: (otherValue: any, message = 'Values do not match'): ValidationRule => ({
    test: (value) => value === otherValue,
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    test: (value) => /^[+]?[\d\s\-()]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value);
        return true;
      } catch