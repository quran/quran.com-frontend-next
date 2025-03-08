export const VOICE_SEARCH_REQUESTED_EVENT = 'voice-search-requested';

/**
 * Helper function to get error message key and fallback based on error message
 *
 * @param {string} errorMessage - The error message from the speech recognition API
 * @returns {{ key: string; fallback: string }} An object with the translation key and fallback message
 */
const getVoiceSearchErrorInfo = (errorMessage: string): { key: string; fallback: string } => {
  if (errorMessage === 'Microphone access denied') {
    return {
      key: 'voice.no-permission',
      fallback: 'Microphone access denied. Please allow microphone access to use voice search.',
    };
  }

  if (errorMessage === 'No speech detected') {
    return {
      key: 'voice.not-supported',
      fallback: 'No speech detected. Please try again.',
    };
  }

  return {
    key: 'voice.error',
    fallback: 'An error occurred during voice search. Please try again.',
  };
};

export default getVoiceSearchErrorInfo;
