import React, { RefObject, useState, useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import DrawerSearchIcon from '../Buttons/DrawerSearchIcon';

import styles from './Header.module.scss';

import VoiceSearch from '@/components/Search/VoiceSearch';
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
  onMicError?: (error: Error) => void;
}

const Header: React.FC<Props> = ({
  onSearchQueryChange,
  resetQueryAndResults,
  inputRef,
  isSearching,
  searchQuery,
  setSearchQuery,
  onMicError,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(false);

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
    if (onMicError) {
      onMicError(error);
    }
  };

  return (
    <>
      <DrawerSearchIcon />
      <div className={classNames(styles.searchInputContainer)} data-testid="search-drawer-header">
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
              <button type="button" className={styles.clear} onClick={resetQueryAndResults}>
                {t('input.clear')}
              </button>
              <Separator isVertical className={styles.separator} />
            </>
          )}
          {isSpeechRecognitionSupported && (
            <VoiceSearch
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
};

export default Header;
