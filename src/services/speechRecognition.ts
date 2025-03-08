/* eslint-disable react-func/max-lines-per-function */
import checkSpeechRecognitionSupport from '@/utils/browser';
import { OFFLINE_ERROR } from 'src/api';

// TypeScript interface for SpeechRecognition
export interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    isFinal?: boolean;
  };
}

export interface SpeechRecognitionError extends Event {
  error: string;
}

export interface SpeechRecognitionInterface extends EventTarget {
  lang: string;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionError) => void;
}

// Define the global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
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
 * @returns {Error} Error object
 */
export const handleSpeechRecognitionError = (event: SpeechRecognitionError): Error => {
  if (event.error === 'network') {
    return new Error(OFFLINE_ERROR);
  }
  if (event.error === 'not-allowed') {
    return new Error('Microphone access denied');
  }
  if (event.error === 'no-speech') {
    return new Error('No speech detected');
  }
  return new Error(`Speech recognition error: ${event.error}`);
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
  recognition.lang = options.lang || 'ar';
  recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;

  // Set up event handlers
  recognition.onresult = (event) => {
    const { transcript } = event.results[0][0];
    const isFinal = event.results.isFinal !== undefined ? event.results.isFinal : true;

    if (options.onResult) {
      options.onResult({ transcript, isFinal });
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
