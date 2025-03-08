import { useState, useRef, useEffect, useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import { setIsSearchDrawerOpen, setDisableSearchDrawerTransition } from '@/redux/slices/navbar';
import type { SpeechRecognitionInterface } from '@/services/speechRecognition';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
} from '@/services/speechRecognition';
import Language from '@/types/Language';
import { logButtonClick } from '@/utils/eventLogger';
import { isMobile } from '@/utils/responsive';
import cleanTranscript from '@/utils/text';
import { VOICE_SEARCH_REQUESTED_EVENT } from '@/utils/voice-search';

export interface UseVoiceSearchOptions {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isInSearchDrawer?: boolean;
  onError?: (error: Error) => void;
  shouldOpenDrawerOnMobile?: boolean;
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
      // Clean the transcript by removing left-to-right and right-to-left marks
      const cleanedTranscript = cleanTranscript(transcript);

      // Set the cleaned transcript as the search query
      options.setSearchQuery(cleanedTranscript);

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
   * Stop the microphone
   */
  const stopMicrophone = useCallback(() => {
    if (speechRecRef.current && isMicActive) {
      try {
        // Call the stop method directly on the speech recognition instance
        speechRecRef.current.stop();
        setIsMicActive(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, [isMicActive]);

  /**
   * Handle voice search functionality
   */
  const handleVoiceSearch = useCallback(() => {
    try {
      // Check if we should open the search drawer on mobile
      const shouldOpenDrawer =
        options.shouldOpenDrawerOnMobile && !options.isInSearchDrawer && isMobile();

      if (shouldOpenDrawer) {
        // Open the search drawer on mobile
        dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
        dispatch({ type: setIsSearchDrawerOpen.type, payload: true });

        // Dispatch a custom event to indicate that voice search was requested
        window.dispatchEvent(new Event(VOICE_SEARCH_REQUESTED_EVENT));

        return; // Exit early as the drawer will handle voice search
      }

      if (!isMicActive) {
        // Initialize and start speech recognition
        if (initializeSpeechRecognition()) {
          startSpeechRecognition();
        }
      } else {
        // Stop speech recognition
        stopMicrophone();
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
    stopMicrophone,
    options,
    dispatch,
  ]);

  return {
    isMicActive,
    isSupported,
    handleVoiceSearch,
    stopMicrophone,
  };
};

export default useVoiceSearch;
