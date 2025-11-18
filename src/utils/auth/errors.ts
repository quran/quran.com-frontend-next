/* eslint-disable max-lines */
import { ServerErrorCodes, BASE_SERVER_ERRORS_MAP } from '@/types/auth/error';
import { AuthError, AuthErrorType } from '@/types/auth/errorTypes';

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
 * Helper function to safely extract message from unknown error
 * @param {unknown} error - Unknown error object
 * @returns {string | undefined} Error message if available
 */
const getErrorMessage = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined;
  }
  return undefined;
};

/**
 * Helper function to safely extract status from unknown error
 * @param {unknown} error - Unknown error object
 * @returns {number | undefined} HTTP status if available
 */
const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      return error.status;
    }
    if (
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response
    ) {
      return typeof error.response.status === 'number' ? error.response.status : undefined;
    }
  }
  return undefined;
};

/**
 * Helper function to safely extract code from unknown error
 * @param {unknown} error - Unknown error object
 * @returns {string | undefined} Error code if available
 */
const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'code' in error) {
    return typeof error.code === 'string' ? error.code : undefined;
  }
  return undefined;
};

/**
 * Create a standardized AuthError instance
 * @param {AuthErrorType} type - The error type
 * @param {string} message - User-friendly error message
 * @param {unknown} error - Original error object
 * @param {boolean} recoverable - Whether the error is recoverable
 * @param {Record<string, any>} context - Additional context information
 * @returns {AuthError} AuthError instance
 * @throws Error if required parameters are missing
 */
export const createAuthError = (
  type: AuthErrorType,
  message: string,
  error: unknown,
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
 * @param {unknown} type - Error type to validate
 * @returns {boolean} true if valid, false otherwise
 */
export const isValidErrorType = (type: unknown): type is AuthErrorType => {
  return Object.values(AuthErrorType).includes(type as AuthErrorType);
};

/**
 * Validate error message
 * @param {unknown} message - Message to validate
 * @returns {boolean} true if valid, false otherwise
 */
export const isValidErrorMessage = (message: unknown): message is string => {
  return typeof message === 'string' && message.trim().length > 0;
};

/**
 * Create an unauthorized error
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for unauthorized access
 */
export const createUnauthorizedError = (
  error: unknown,
  context?: Record<string, any>,
): AuthError => {
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for forbidden access
 */
export const createForbiddenError = (error: unknown, context?: Record<string, any>): AuthError => {
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for validation issues
 */
export const createValidationError = (error: unknown, context?: Record<string, any>): AuthError => {
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for server issues
 */
export const createServerError = (error: unknown, context?: Record<string, any>): AuthError => {
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for network issues
 */
export const createNetworkError = (error: unknown, context?: Record<string, any>): AuthError => {
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for incomplete profile
 */
export const createProfileIncompleteError = (
  error: unknown,
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
 * @param {unknown} error - Original error
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for unknown issues
 */
export const createUnknownError = (error: unknown, context?: Record<string, any>): AuthError => {
  const message = getErrorMessage(error) || 'An unexpected error occurred.';
  return createAuthError(AuthErrorType.UNKNOWN_ERROR, message, error, false, context);
};

/**
 * Create a null/undefined error
 * @param {unknown} error - Original error (usually null/undefined)
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} AuthError for null/undefined errors
 */
export const createNullError = (error: unknown, context?: Record<string, any>): AuthError => {
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
 * @param {unknown} error - Raw error to classify
 * @param {Record<string, any>} context - Additional context
 * @returns {AuthError} Classified AuthError
 */
export const classifyError = (error: unknown, context?: Record<string, any>): AuthError => {
  if (!error) return createNullError(error, context);

  // Network errors
  const errorCode = getErrorCode(error);
  const errorMessage = getErrorMessage(error);

  if (errorCode === 'NETWORK_ERROR' || (errorMessage && errorMessage.includes('fetch'))) {
    return createNetworkError(error, context);
  }

  // HTTP status-based errors
  const status = getErrorStatus(error);
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
  if (errorMessage && (errorMessage.includes('profile') || errorMessage.includes('complete'))) {
    return createProfileIncompleteError(error, context);
  }

  // Default to unknown error
  return createUnknownError(error, context);
};
