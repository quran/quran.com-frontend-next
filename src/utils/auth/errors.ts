/* eslint-disable max-lines */
import { AuthError, AuthErrorType } from './errorTypes';

import { ServerErrorCodes, BASE_SERVER_ERRORS_MAP } from '@/types/auth/error';

export enum AuthErrorCodes {
  Invalid = 'INVALID',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  MinLength = 'MIN_LENGTH',
  MaxLength = 'MAX_LENGTH',
  ExactLength = 'EXACT_LENGTH',
  Mismatch = 'MISMATCH',
  Missing = 'MISSING',
  Duplicate = 'DUPLICATE',
  Banned = 'BANNED',
  Expired = 'EXPIRED',
  Used = 'USED',
  Immutable = 'IMMUTABLE',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  ValidationError = 'ValidationError',
}

interface APIErrorResponse {
  details?: {
    success: boolean;
    error?: {
      code: string;
      message: string;
      details: Record<string, string>;
    };
  };
  message?: string;
  type?: string;
  success: boolean;
  error?: {
    code: string;
    message: string;
    details: Record<string, string>;
  };
  status?: number;
}

type ErrorFieldMap = Record<string, string>;

export enum AuthEndpoint {
  SignIn = 'signIn',
  SignUp = 'signUp',
  ForgotPassword = 'forgotPassword',
  ResetPassword = 'resetPassword',
  CompleteSignup = 'completeSignup',
  UpdateUserProfile = 'updateUserProfile',
}

// Map of API endpoint to their error field keys
const API_ERROR_FIELD_MAP: Record<AuthEndpoint, ErrorFieldMap> = {
  [AuthEndpoint.SignIn]: {
    credentials: 'password',
    email: 'email',
  },
  [AuthEndpoint.SignUp]: {
    email: 'email',
    password: 'password',
    confirmPassword: 'confirmPassword',
    firstName: 'firstName',
    lastName: 'lastName',
  },
  [AuthEndpoint.ForgotPassword]: {
    email: 'email',
  },
  [AuthEndpoint.ResetPassword]: {
    password: 'password',
    token: 'token',
  },
  [AuthEndpoint.CompleteSignup]: {
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    username: 'username',
  },
  [AuthEndpoint.UpdateUserProfile]: {
    firstName: 'firstName',
    lastName: 'lastName',
    username: 'username',
  },
};

interface ErrorMappingConfig {
  endpoint: keyof typeof API_ERROR_FIELD_MAP;
  fieldMap?: ErrorFieldMap;
  defaultErrorKey?: string;
  errorMessageMap?: Record<number, string>; // Map HTTP status codes to error messages
}

const handleResponseError = async (response: Response): Promise<APIErrorResponse> => {
  const errorData = await response.json();
  errorData.status = response.status;
  return errorData;
};

const handleStatusBasedError = (
  errorData: APIErrorResponse,
  config: ErrorMappingConfig,
): { [key: string]: string } | null => {
  if (errorData.status && config.errorMessageMap?.[errorData.status]) {
    return {
      form: config.errorMessageMap[errorData.status],
    };
  }
  return null;
};

const mapErrorDetailsToFields = (
  error: APIErrorResponse['error'],
  endpointErrorMap: ErrorFieldMap,
  config: ErrorMappingConfig,
): { [key: string]: string } => {
  const result: Record<string, string> = {};

  Object.entries(error.details || {}).forEach(([errorField, errorCode]) => {
    const field = config.fieldMap?.[errorField] || endpointErrorMap[errorField];
    if (field) {
      result[field] =
        BASE_SERVER_ERRORS_MAP[errorCode as ServerErrorCodes] ||
        BASE_SERVER_ERRORS_MAP[error.code as ServerErrorCodes] ||
        config.defaultErrorKey ||
        'errors.badRequest';
    }
  });

  return result;
};

const handleErrorResponse = (
  errorData: APIErrorResponse,
  error: APIErrorResponse['error'],
  config: ErrorMappingConfig,
): { [key: string]: string } => {
  const endpointErrorMap = API_ERROR_FIELD_MAP[config.endpoint];
  if (!endpointErrorMap) {
    return {
      form:
        config.defaultErrorKey ||
        BASE_SERVER_ERRORS_MAP[error.code as ServerErrorCodes] ||
        'errors.badRequest',
    };
  }

  const result = mapErrorDetailsToFields(error, endpointErrorMap, config);
  return Object.keys(result).length === 0
    ? {
        form:
          config.defaultErrorKey ||
          BASE_SERVER_ERRORS_MAP[error.code as ServerErrorCodes] ||
          'errors.badRequest',
      }
    : result;
};

/**
 * Maps API error responses to form field errors
 * @param {APIErrorResponse | Response} response - The API error response or fetch Response
 * @param {ErrorMappingConfig} config - Configuration for error mapping
 * @returns {{ [key: string]: string }} An object with field keys and their corresponding error translation keys
 */
export const mapAPIErrorToFormFields = async (
  response: APIErrorResponse | Response,
  config: ErrorMappingConfig,
): Promise<{ [key: string]: string }> => {
  let errorData: APIErrorResponse;

  if (response instanceof Response) {
    try {
      errorData = await handleResponseError(response);
    } catch (e) {
      return {
        form: config.errorMessageMap?.[response.status] || 'errors.badRequest',
      };
    }
  } else {
    errorData = response;
  }

  const statusError = handleStatusBasedError(errorData, config);
  if (statusError) return statusError;

  const error = errorData.details?.error || errorData.error;
  if (!error) {
    return {
      form: config.defaultErrorKey || 'errors.badRequest',
    };
  }

  return handleErrorResponse(errorData, error, config);
};

/**
 * Core Error Functions
 * Consolidated error creation and validation utilities
 */

/**
 * Create a standardized AuthError instance
 * @param {AuthErrorType} type - The error type
 * @param {string} message - User-friendly error message
 * @param {any} error - Original error object
 * @param {boolean} recoverable - Whether the error is recoverable
 * @param {Record<string, any>} context - Additional context information
 * @returns {AuthError} AuthError instance
 * @throws Error if required parameters are missing
 */
export const createAuthError = (
  type: AuthErrorType,
  message: string,
  error: any,
  recoverable: boolean,
  context?: Record<string, any>,
): AuthError => {
  // Validate required parameters
  if (!type) {
    throw new Error('Error type is required');
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Valid error message is required');
  }

  return {
    type,
    message,
    originalError: error,
    recoverable: Boolean(recoverable),
    context,
  };
};

/**
 * Validate error type
 * @param {any} type - Error type to validate
 * @returns {boolean} true if valid, false otherwise
 */
export const isValidErrorType = (type: any): type is AuthErrorType => {
  return Object.values(AuthErrorType).includes(type);
};

/**
 * Validate error message
 * @param {any} message - Message to validate
 * @returns {boolean} true if valid, false otherwise
 */
export const isValidErrorMessage = (message: any): message is string => {
  return typeof message === 'string' && message.trim().length > 0;
};

/**
 * Create an unauthorized error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for unauthorized access
 */
export const createUnauthorizedError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.UNAUTHORIZED,
    'Your session has expired. Please log in again.',
    error,
    true,
    context,
  );
};

/**
 * Create a forbidden error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for forbidden access
 */
export const createForbiddenError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.FORBIDDEN,
    'You do not have permission to access this resource.',
    error,
    false,
    context,
  );
};

/**
 * Create a validation error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for validation issues
 */
export const createValidationError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.VALIDATION_ERROR,
    'Please check your input and try again.',
    error,
    true,
    context,
  );
};

/**
 * Create a server error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for server issues
 */
export const createServerError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.SERVER_ERROR,
    'Server error. Please try again later.',
    error,
    true,
    context,
  );
};

/**
 * Create a network error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for network issues
 */
export const createNetworkError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.NETWORK_ERROR,
    'Network connection error. Please check your internet connection.',
    error,
    true,
    context,
  );
};

/**
 * Create a profile incomplete error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for incomplete profile
 */
export const createProfileIncompleteError = (
  error: any,
  context?: Record<string, any>,
): AuthError => {
  return createAuthError(
    AuthErrorType.PROFILE_INCOMPLETE,
    'Please complete your profile to continue.',
    error,
    true,
    context,
  );
};

/**
 * Create a generic unknown error
 * @param {any} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for unknown issues
 */
export const createUnknownError = (error: any, context?: Record<string, any>): AuthError => {
  const message = error?.message || 'An unexpected error occurred.';
  return createAuthError(AuthErrorType.UNKNOWN_ERROR, message, error, false, context);
};

/**
 * Create a null/undefined error
 * @param {any} error - Original error (usually null/undefined)
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for null/undefined errors
 */
export const createNullError = (error: any, context?: Record<string, any>): AuthError => {
  return createAuthError(
    AuthErrorType.UNKNOWN_ERROR,
    'An unknown error occurred',
    error,
    false,
    context,
  );
};

/**
 * Classify an error and create appropriate AuthError
 * @param {any} error - Raw error to classify
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} Classified AuthError
 */
export const classifyError = (error: any, context?: Record<string, any>): AuthError => {
  if (!error) return createNullError(error, context);

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
    return createNetworkError(error, context);
  }

  // HTTP status-based errors
  const status = error.status || error.response?.status;
  if (status) {
    switch (status) {
      case 401:
        return createUnauthorizedError(error, context);
      case 403:
        return createForbiddenError(error, context);
      case 422:
        return createValidationError(error, context);
      default:
        if (status >= 500 && status < 600) {
          return createServerError(error, context);
        }
    }
  }

  // Profile-related errors
  if (error.message?.includes('profile') || error.message?.includes('complete')) {
    return createProfileIncompleteError(error, context);
  }

  // Default to unknown error
  return createUnknownError(error, context);
};
