import {
  getErrorKeyFromCode,
  getErrorKeyFromMessage,
  SpeechRecognitionErrorCode,
} from './voice-search-errors';

import { ToastStatus } from '@/dls/Toast/Toast';

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
    // If the error has an 'error' property, it's a SpeechRecognitionError
    if ('error' in error && typeof (error as any).error === 'string') {
      const errorCode = (error as any).error as SpeechRecognitionErrorCode;
      const key = getErrorKeyFromCode(errorCode);
      toast(t(key), { status: ToastStatus.Warning });
    } else {
      // Fallback to using the error message
      const key = getErrorKeyFromMessage(error.message);
      toast(t(key), { status: ToastStatus.Warning });
    }
  };
};

export default useHandleMicError;
