// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import { Alert } from 'react-native';
import { logger } from './logger';

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Auth errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Server errors
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  
  // Unknown
  UNKNOWN = 'UNKNOWN',
}

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Unable to connect to the server. Please check your internet connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCode.UNAUTHORIZED]: 'Your session has expired. Please login again.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action.',
  [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please login again.',
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCode.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.CONFLICT]: 'This resource already exists.',
  [ErrorCode.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

/**
 * Convert axios error to standardized ApiError
 */
export function handleApiError(error: unknown): ApiError {
  // Axios error
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    // Network error
    if (!error.response) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: ERROR_MESSAGES[ErrorCode.NETWORK_ERROR],
      };
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return {
        code: ErrorCode.TIMEOUT,
        message: ERROR_MESSAGES[ErrorCode.TIMEOUT],
      };
    }

    // Map HTTP status to error code
    let code: ErrorCode;
    switch (status) {
      case 400:
        code = ErrorCode.VALIDATION_ERROR;
        break;
      case 401:
        code = ErrorCode.UNAUTHORIZED;
        break;
      case 403:
        code = ErrorCode.FORBIDDEN;
        break;
      case 404:
        code = ErrorCode.NOT_FOUND;
        break;
      case 409:
        code = ErrorCode.CONFLICT;
        break;
      case 500:
      case 502:
      case 503:
        code = ErrorCode.SERVER_ERROR;
        break;
      default:
        code = ErrorCode.UNKNOWN;
    }

    return {
      code,
      message: data?.message || ERROR_MESSAGES[code],
      status,
      details: data,
    };
  }

  // Generic error
  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN,
      message: error.message || ERROR_MESSAGES[ErrorCode.UNKNOWN],
    };
  }

  // Unknown error
  return {
    code: ErrorCode.UNKNOWN,
    message: ERROR_MESSAGES[ErrorCode.UNKNOWN],
    details: error,
  };
}

/**
 * Show user-friendly error alert
 */
export function showErrorAlert(error: ApiError | Error | unknown, title = 'Error'): void {
  const apiError = error instanceof Error 
    ? handleApiError(error) 
    : (error as ApiError);

  Alert.alert(title, apiError.message, [{ text: 'OK' }]);
  
  logger.error('User shown error', apiError);
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

/**
 * Check if error is specific type
 */
export function isAuthError(error: ApiError): boolean {
  return [
    ErrorCode.UNAUTHORIZED,
    ErrorCode.FORBIDDEN,
    ErrorCode.TOKEN_EXPIRED,
  ].includes(error.code as ErrorCode);
}

export function isNetworkError(error: ApiError): boolean {
  return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT].includes(
    error.code as ErrorCode
  );
}

export function isValidationError(error: ApiError): boolean {
  return [ErrorCode.VALIDATION_ERROR, ErrorCode.INVALID_INPUT].includes(
    error.code as ErrorCode
  );
}

/**
 * Retry helper for failed requests
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const apiError = handleApiError(error);

      // Don't retry auth or validation errors
      if (isAuthError(apiError) || isValidationError(apiError)) {
        throw error;
      }

      // Wait before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError;
}