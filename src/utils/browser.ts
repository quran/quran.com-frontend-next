/**
 * Check if speech recognition is supported by the browser
 *
 * @returns {boolean} Whether speech recognition is supported
 */
const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;

  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export default isSpeechRecognitionSupported;
