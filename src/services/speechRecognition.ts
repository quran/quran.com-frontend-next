/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import Language from '@/types/Language';
import checkSpeechRecognitionSupport from '@/utils/browser';
import { cleanTranscript } from '@/utils/string';
import { SpeechRecognitionErrorCode } from '@/utils/voice-search-errors';

// TypeScript interface for SpeechRecognition
export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly length: number;
  isFinal?: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionError extends Event {
  error: SpeechRecognitionErrorCode;
}

export interface SpeechRecognitionInterface extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionError) => void;
  onnomatch?: () => void;
  onaudiostart?: () => void;
  onaudioend?: () => void;
  onsoundstart?: () => void;
  onsoundend?: () => void;
  onspeechstart?: () => void;
  onspeechend?: () => void;
}

// Define the global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

export interface SpeechRecognitionResultData {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  continuous?: boolean;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResultData) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onNoMatch?: () => void;
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  onSoundStart?: () => void;
  onSoundEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

/**
 * Check if speech recognition is supported by the browser
 *
 * @returns {boolean} Whether speech recognition is supported
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return checkSpeechRecognitionSupport();
};

/**
 * Handle speech recognition errors
 *
 * @param {SpeechRecognitionError} event - Error event
 * @returns {Error} Error object with the original error code
 */
export const handleSpeechRecognitionError = (event: SpeechRecognitionError): Error => {
  // Create a custom error that preserves the original error code
  const error = new Error(`Speech recognition error: ${event.error}`);
  // Add the original error code to the error object
  (error as any).error = event.error;
  return error;
};

/**
 * Create a speech recognition instance
 *
 * @param {SpeechRecognitionOptions} options - Options for speech recognition
 * @returns {SpeechRecognitionInterface} Speech recognition instance
 */
export const createSpeechRecognition = (
  options: SpeechRecognitionOptions,
): SpeechRecognitionInterface => {
  if (!checkSpeechRecognitionSupport()) {
    const error = new Error('Speech recognition is not supported by this browser');
    if (options.onError) {
      options.onError(error);
    }
    throw error;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();

  // Set default options
  recognition.lang = options.lang || Language.AR;
  if (options.interimResults !== undefined) {
    recognition.interimResults = options.interimResults;
  }
  if (options.continuous !== undefined) {
    recognition.continuous = options.continuous;
  }
  if (options.maxAlternatives !== undefined) {
    recognition.maxAlternatives = options.maxAlternatives;
  }

  // Set up event handlers
  recognition.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const { transcript } = event.results[lastResultIndex][0];
    const isFinal =
      event.results[lastResultIndex].isFinal !== undefined
        ? event.results[lastResultIndex].isFinal
        : true;

    if (options.onResult) {
      // Clean the transcript by removing left-to-right and right-to-left marks
      const cleanedTranscript = cleanTranscript(transcript);
      options.onResult({ transcript: cleanedTranscript, isFinal });
    }
  };

  recognition.onend = () => {
    if (options.onEnd) {
      options.onEnd();
    }
  };

  recognition.onerror = (event) => {
    const error = handleSpeechRecognitionError(event);

    // Call the onError callback if provided
    if (options.onError) {
      options.onError(error);
    }
  };

  // Add additional event handlers if provided
  if (options.onNoMatch) {
    recognition.onnomatch = options.onNoMatch;
  }

  if (options.onAudioStart) {
    recognition.onaudiostart = options.onAudioStart;
  }

  if (options.onAudioEnd) {
    recognition.onaudioend = options.onAudioEnd;
  }

  if (options.onSoundStart) {
    recognition.onsoundstart = options.onSoundStart;
  }

  if (options.onSoundEnd) {
    recognition.onsoundend = options.onSoundEnd;
  }

  if (options.onSpeechStart) {
    recognition.onspeechstart = options.onSpeechStart;
  }

  if (options.onSpeechEnd) {
    recognition.onspeechend = options.onSpeechEnd;
  }

  return recognition;
};

/**
 * Start speech recognition
 *
 * @param {SpeechRecognitionInterface} recognition - Speech recognition instance
 */
export const startSpeechRecognition = (recognition: SpeechRecognitionInterface): void => {
  recognition.start();
};

/**
 * Stop speech recognition
 *
 * @param {SpeechRecognitionInterface} recognition - Speech recognition instance
 */
export const stopSpeechRecognition = (recognition: SpeechRecognitionInterface): void => {
  recognition.stop();
};
