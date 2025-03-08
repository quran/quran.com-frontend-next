import React, {
  RefObject,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import DrawerSearchIcon from '../Buttons/DrawerSearchIcon';

import styles from './Header.module.scss';

import VoiceSearch, { VoiceSearchRef } from '@/components/Search/VoiceSearch';
import Separator from '@/dls/Separator/Separator';
import checkSpeechRecognitionSupport from '@/utils/browser';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (event: React.FormEvent<HTMLInputElement>) => void;
  resetQueryAndResults: () => void;
  inputRef: RefObject<HTMLInputElement>;
  setSearchQuery: (query: string) => void;
  onMicPermissionError?: (error: Error) => void;
}

export interface SearchDrawerHeaderRef {
  stopMicrophone: () => void;
  startMicrophone: () => void;
}

const Header = forwardRef<SearchDrawerHeaderRef, Props>(
  (
    {
      onSearchQueryChange,
      resetQueryAndResults,
      inputRef,
      isSearching,
      searchQuery,
      setSearchQuery,
      onMicPermissionError,
    },
    ref,
  ) => {
    const { t } = useTranslation('common');
    const router = useRouter();
    const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
      useState<boolean>(false);

    // Check if speech recognition is supported
    useEffect(() => {
      setIsSpeechRecognitionSupported(checkSpeechRecognitionSupport());
    }, []);

    // Ensure the drawer stays open when using voice search
    useEffect(() => {
      if (searchQuery && inputRef.current) {
        // Focus the input after a short delay to ensure it's ready
        const focusTimeout = setTimeout(() => {
          inputRef.current?.focus();
        }, 300);

        return () => clearTimeout(focusTimeout);
      }
      return undefined; // Add explicit return for when the condition is not met
    }, [searchQuery, inputRef]);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      inputRef.current?.blur();
      if (searchQuery) {
        router.push(getSearchQueryNavigationUrl(searchQuery));
      }
    };

    // Handle voice search errors
    const handleVoiceSearchError = (error: Error) => {
      if (onMicPermissionError) {
        onMicPermissionError(error);
      }
    };

    // Reference to the voice search component
    const voiceSearchRef = useRef<VoiceSearchRef>(null);

    // Expose the stopMicrophone and startMicrophone functions to the parent component
    useImperativeHandle(ref, () => ({
      stopMicrophone: () => {
        if (voiceSearchRef.current) {
          voiceSearchRef.current.stopMicrophone();
        }
      },
      startMicrophone: () => {
        if (voiceSearchRef.current) {
          voiceSearchRef.current.startMicrophone();
        }
      },
    }));

    // Handle reset query and results - stop microphone if active
    const handleResetQueryAndResults = () => {
      // Stop the microphone if it's active
      if (voiceSearchRef.current) {
        voiceSearchRef.current.stopMicrophone();
      }

      // Call the original reset function
      resetQueryAndResults();
    };

    return (
      <>
        <DrawerSearchIcon />
        <div className={classNames(styles.searchInputContainer)}>
          <form onSubmit={onSubmit} className={styles.from}>
            <input
              className={styles.searchInput}
              type="search"
              enterKeyHint="search"
              ref={inputRef}
              dir="auto"
              placeholder={t('search.title')}
              onChange={onSearchQueryChange}
              value={searchQuery}
              disabled={isSearching}
            />
          </form>
          <div className={styles.actionsContainer}>
            {searchQuery && (
              <>
                <button type="button" className={styles.clear} onClick={handleResetQueryAndResults}>
                  {t('input.clear')}
                </button>
                <Separator isVertical className={styles.separator} />
              </>
            )}
            {isSpeechRecognitionSupported && (
              <VoiceSearch
                ref={voiceSearchRef}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                inputRef={inputRef}
                isInSearchDrawer
                onError={handleVoiceSearchError}
              />
            )}
          </div>
        </div>
      </>
    );
  },
);

// Add display name for better debugging
Header.displayName = 'SearchDrawerHeader';

export default Header;
