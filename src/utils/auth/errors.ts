/* eslint-disable max-lines */
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
const mapAPIErrorToFormFields = async (
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

export default mapAPIErrorToFormFields;
