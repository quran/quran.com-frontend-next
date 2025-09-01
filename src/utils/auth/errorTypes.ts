/** Authentication error types */
export enum AuthErrorType {
  NETWORK_ERROR = 'network_error',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  PROFILE_INCOMPLETE = 'profile_incomplete',
  VALIDATION_ERROR = 'validation_error',
  SERVER_ERROR = 'server_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/** Authentication error interface */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
  recoverable: boolean;
}
