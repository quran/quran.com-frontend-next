/* eslint-disable max-lines */
import { useState, useRef, useEffect, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import {
  selectMicrophoneActive,
  setMicrophoneActive,
  stopMicrophone,
} from '@/redux/slices/microphone';
import type { SpeechRecognitionInterface } from '@/services/speechRecognition';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
} from '@/services/speechRecognition';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { cleanTranscript } from '@/utils/string';

let sharedSpeechRecognitionInstance: SpeechRecognitionInterface | null = null;

export const getSpeechRecognitionInstance = (): SpeechRecognitionInterface | null =>
  sharedSpeechRecognitionInstance;

export const setSpeechRecognitionInstance = (instance: SpeechRecognitionInterface | null): void => {
  sharedSpeechRecognitionInstance = instance;
};

export interface UseVoiceSearchOptions {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isInSearchDrawer?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for voice search functionality
 *
 * @param {UseVoiceSearchOptions} options - Options for the hook
 * @returns {object} Voice search state and handlers
 */
const useVoiceSearch = (options: UseVoiceSearchOptions) => {
  const [isSupported, setIsSupported] = useState<boolean>(true); // Assume supported initially
  const speechRecRef = useRef<SpeechRecognitionInterface | null>(null);
  const dispatch = useDispatch();

  // Get microphone state from Redux
  const isMicActive = useSelector(selectMicrophoneActive);

  // Check if speech recognition is supported on mount
  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
  }, []);

  // Effect to keep search expanded when results are being shown
  useEffect(() => {
    // Only expand the command bar if we're not in the search drawer
    if (options.searchQuery && options.searchQuery.trim() !== '' && !options.isInSearchDrawer) {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  }, [options.searchQuery, dispatch, options.isInSearchDrawer]);

  // Effect to stop speech recognition when microphone is deactivated
  useEffect(() => {
    if (!isMicActive) {
      if (sharedSpeechRecognitionInstance) {
        try {
          sharedSpeechRecognitionInstance.stop();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error stopping speech recognition', error);
        }
        sharedSpeechRecognitionInstance = null;
        speechRecRef.current = null;
      }
    }
  }, [isMicActive]);

  /**
   * Handle speech recognition result
   */
  const handleSpeechResult = useCallback(
    (transcript: string) => {
      // Clean the transcript by removing left-to-right and right-to-left marks
      const cleanedTranscript = cleanTranscript(transcript);

      // Set the cleaned transcript as the search query
      options.setSearchQuery(cleanedTranscript);

      // Only expand the command bar if we're not in the search drawer AND microphone is still active
      // This prevents reopening the dropdown after user clicks on a search result
      if (!options.isInSearchDrawer && isMicActive) {
        dispatch({ type: setIsExpanded.type, payload: true });
      }
    },
    [options, dispatch, isMicActive],
  );

  /**
   * Stop speech recognition
   */
  const stopSpeechRecognition = useCallback(() => {
    if (!speechRecRef.current) return;

    try {
      speechRecRef.current.stop();
      logButtonClick('voice_search_stop');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error stopping speech recognition', error);
    }

    // Update Redux state
    dispatch(stopMicrophone());
    sharedSpeechRecognitionInstance = null;
    speechRecRef.current = null;
  }, [dispatch]);

  /**
   * Handle speech end event
   */
  const handleSpeechEnd = useCallback(() => {
    stopSpeechRecognition();

    // Focus the input after speech recognition ends
    if (options.inputRef.current) {
      options.inputRef.current.focus();
    }
  }, [stopSpeechRecognition, options.inputRef]);

  /**
   * Handle speech recognition end
   */
  const handleRecognitionEnd = useCallback(() => {
    // If the microphone is still active, restart recognition
    // This helps with continuous recognition
    if (isMicActive && speechRecRef.current) {
      try {
        speechRecRef.current.start();
      } catch (error) {
        // If we can't restart, stop the microphone
        dispatch(stopMicrophone());
      }
    }
  }, [isMicActive, dispatch]);

  /**
   * Create speech recognition configuration
   */
  const createSpeechRecognitionConfig = useCallback(() => {
    return {
      lang: Language.AR,
      interimResults: true,
      onResult: ({ transcript }) => handleSpeechResult(transcript),
      onEnd: handleRecognitionEnd,
      onSpeechEnd: handleSpeechEnd,
      onError: (error) => {
        stopSpeechRecognition();

        if (options.onError) {
          options.onError(error);
        }
      },
    };
  }, [handleRecognitionEnd, handleSpeechEnd, handleSpeechResult, stopSpeechRecognition, options]);

  /**
   * Initialize speech recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (sharedSpeechRecognitionInstance) {
      speechRecRef.current = sharedSpeechRecognitionInstance;
      return true;
    }

    try {
      speechRecRef.current = createSpeechRecognition(createSpeechRecognitionConfig());
      sharedSpeechRecognitionInstance = speechRecRef.current;
      return true;
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      return false;
    }
  }, [options, createSpeechRecognitionConfig]);

  /**
   * Start speech recognition
   */
  const startSpeechRecognition = useCallback(() => {
    if (!speechRecRef.current) return false;

    try {
      speechRecRef.current.start();
      // Update Redux state
      dispatch(setMicrophoneActive(true));

      logButtonClick('voice_search_start');
      return true;
    } catch (error) {
      // Update Redux state
      dispatch(stopMicrophone());

      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      return false;
    }
  }, [options, dispatch]);

  /**
   * Handle voice search functionality
   */
  const handleVoiceSearch = useCallback(() => {
    try {
      if (!isMicActive) {
        // Initialize and start speech recognition
        if (initializeSpeechRecognition()) {
          startSpeechRecognition();
        }
      } else {
        // Stop speech recognition
        stopSpeechRecognition();
      }
    } catch (error) {
      // Update Redux state
      dispatch(stopMicrophone());

      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
    }
  }, [
    isMicActive,
    initializeSpeechRecognition,
    startSpeechRecognition,
    stopSpeechRecognition,
    options,
    dispatch,
  ]);

  return {
    isMicActive,
    isSupported,
    handleVoiceSearch,
    stopSpeechRecognition,
  };
};

export default useVoiceSearch;
