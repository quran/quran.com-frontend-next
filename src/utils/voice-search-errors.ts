import { ToastStatus } from '@/dls/Toast/Toast';

/**
 * Enum of all possible speech recognition and synthesis error codes
 * Combines error codes from SpeechRecognitionErrorEvent and SpeechSynthesisErrorEvent
 */
export enum SpeechRecognitionErrorCode {
  // Permission errors
  NOT_ALLOWED = 'not-allowed',

  // Speech recognition errors
  NO_SPEECH = 'no-speech',
  ABORTED = 'aborted',
  SERVICE_NOT_ALLOWED = 'service-not-allowed',
  AUDIO_CAPTURE = 'audio-capture',
  BAD_GRAMMAR = 'bad-grammar',
  LANGUAGE_NOT_SUPPORTED = 'language-not-supported',

  // Audio errors (synthesis)
  AUDIO_BUSY = 'audio-busy',
  AUDIO_HARDWARE = 'audio-hardware',

  // Network errors
  NETWORK = 'network',

  // Synthesis errors
  SYNTHESIS_UNAVAILABLE = 'synthesis-unavailable',
  SYNTHESIS_FAILED = 'synthesis-failed',
  TEXT_TOO_LONG = 'text-too-long',
  INVALID_ARGUMENT = 'invalid-argument',

  // Language errors (synthesis)
  LANGUAGE_UNAVAILABLE = 'language-unavailable',
  VOICE_UNAVAILABLE = 'voice-unavailable',

  // Other errors (synthesis)
  CANCELED = 'canceled',
  INTERRUPTED = 'interrupted',
}

/**
 * Whitelist of user-friendly error keys
 * Only these errors will be shown to the user with specific messages
 * All other errors will use the general error message
 */
const USER_FRIENDLY_ERROR_KEYS: Record<string, string> = {
  // Most common errors that users can understand and potentially fix
  [SpeechRecognitionErrorCode.NOT_ALLOWED]: 'voice.no-permission',
  [SpeechRecognitionErrorCode.NO_SPEECH]: 'voice.no-speech',
  [SpeechRecognitionErrorCode.AUDIO_CAPTURE]: 'voice.no-microphone',
  [SpeechRecognitionErrorCode.NETWORK]: 'voice.network',
  [SpeechRecognitionErrorCode.LANGUAGE_UNAVAILABLE]: 'voice.language-unavailable',
  [SpeechRecognitionErrorCode.LANGUAGE_NOT_SUPPORTED]: 'voice.language-unavailable',
};

/**
 * Get the translation key for a speech recognition error code
 * Uses a whitelist approach - only returns specific messages for common errors
 * that users can understand and potentially fix
 *
 * @param {string} errorCode - The error code from the speech recognition API
 * @returns {string} The translation key
 */
export function getErrorKeyFromCode(errorCode: string): string {
  // Check if the error is in our whitelist of user-friendly errors
  if (errorCode in USER_FRIENDLY_ERROR_KEYS) {
    return USER_FRIENDLY_ERROR_KEYS[errorCode];
  }

  // For all other errors, return the general error message
  return 'voice.error';
}

/**
 * Get the translation key for an error message
 * This is a fallback for when we have an error message instead of an error code
 *
 * @param {string} errorMessage - The error message
 * @returns {string} The translation key
 */
export function getErrorKeyFromMessage(errorMessage: string): string {
  // Check for network errors in the message
  if (errorMessage.includes('offline') || errorMessage.includes('network')) {
    return 'voice.network';
  }

  // For all other errors, return the general error message
  return 'voice.error';
}

/**
 * Custom hook to handle microphone errors consistently across components
 *
 * @param {Function} toast - Toast function to display error messages
 * @param {Function} t - Translation function
 * @returns {Function} Error handler function
 */
export const useHandleMicError = (
  toast: (message: string, options?: any) => void,
  t: (key: string, options?: any) => string,
) => {
  return (error: Error) => {
    let key = '';
    let errorCode = '';
    // If the error has an 'error' property, it's a SpeechRecognitionError
    if ('error' in error && typeof (error as any).error === 'string') {
      errorCode = (error as any).error as SpeechRecognitionErrorCode;
      key = getErrorKeyFromCode(errorCode);
    } else {
      // Fallback to using the error message
      key = getErrorKeyFromMessage(error.message);
    }
    toast(
      t(key, {
        errorCode,
      }),
      { status: ToastStatus.Warning },
    );
  };
};
