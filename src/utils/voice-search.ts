/**
 * Helper function to get error message key and fallback based on error message
 *
 * @param {string} errorMessage - The error message from the speech recognition API
 * @returns {{ key: string; fallback: string }} An object with the translation key and fallback message
 */
const getVoiceSearchErrorInfo = (errorMessage: string): { key: string; fallback: string } => {
  if (errorMessage === 'Microphone access denied') {
    return {
      key: 'voice-search.mic-permission-denied',
      fallback: 'Microphone access denied. Please allow microphone access to use voice search.',
    };
  }

  if (errorMessage === 'No speech detected') {
    return {
      key: 'voice-search.no-speech-detected',
      fallback: 'No speech detected. Please try again.',
    };
  }

  return {
    key: 'voice-search.error',
    fallback: 'An error occurred during voice search. Please try again.',
  };
};

export default getVoiceSearchErrorInfo;
