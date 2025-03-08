import { useState, useRef, useEffect, useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import type { SpeechRecognitionInterface } from '@/services/speechRecognition';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
} from '@/services/speechRecognition';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';

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
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true); // Assume supported initially
  const speechRecRef = useRef<SpeechRecognitionInterface | null>(null);
  const dispatch = useDispatch();

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

  /**
   * Handle speech recognition result
   */
  const handleSpeechResult = useCallback(
    (transcript: string) => {
      options.setSearchQuery(transcript);

      // Only expand the command bar if we're not in the search drawer
      if (!options.isInSearchDrawer) {
        dispatch({ type: setIsExpanded.type, payload: true });
      }
    },
    [options, dispatch],
  );

  /**
   * Handle speech recognition end
   */
  const handleSpeechEnd = useCallback(() => {
    setIsMicActive(false);
    // Focus the input after speech recognition ends
    if (options.inputRef.current) {
      options.inputRef.current.focus();
    }
  }, [options.inputRef]);

  /**
   * Initialize speech recognition
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (speechRecRef.current) return true;

    try {
      speechRecRef.current = createSpeechRecognition({
        lang: Language.AR,
        interimResults: true,
        onResult: ({ transcript }) => handleSpeechResult(transcript),
        onEnd: handleSpeechEnd,
        onError: (error) => {
          setIsMicActive(false);
          if (options.onError) {
            options.onError(error);
          }
        },
      });
      return true;
    } catch (error) {
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      return false;
    }
  }, [options, handleSpeechResult, handleSpeechEnd]);

  /**
   * Start speech recognition
   */
  const startSpeechRecognition = useCallback(() => {
    if (!speechRecRef.current) return false;

    try {
      speechRecRef.current.start();
      setIsMicActive(true);
      logButtonClick('voice_search_start');
      return true;
    } catch (error) {
      setIsMicActive(false);
      if (options.onError && error instanceof Error) {
        options.onError(error);
      }
      return false;
    }
  }, [options]);

  /**
   * Stop speech recognition
   */
  const stopSpeechRecognition = useCallback(() => {
    if (!speechRecRef.current) return;

    try {
      speechRecRef.current.stop();
      logButtonClick('voice_search_stop');
    } catch (error) {
      setIsMicActive(false);
    }
    setIsMicActive(false);
  }, []);

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
      setIsMicActive(false);
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
  ]);

  return {
    isMicActive,
    isSupported,
    handleVoiceSearch,
  };
};

export default useVoiceSearch;
