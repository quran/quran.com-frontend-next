/* eslint-disable max-lines */
import React, { useCallback, useRef, useState, useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchInput.module.scss';

import ExpandedSearchInputSection from '@/components/Search/CommandBar/ExpandedSearchInputSection';
import VoiceSearch, { VoiceSearchRef } from '@/components/Search/VoiceSearch';
import Input, { InputSize } from '@/dls/Forms/Input';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import useSearchWithVoice from '@/hooks/useSearchWithVoice';
import SearchIcon from '@/icons/search.svg';
import { selectIsExpanded, setIsExpanded } from '@/redux/slices/CommandBar/state';
import { setIsSearchDrawerOpen, setDisableSearchDrawerTransition } from '@/redux/slices/navbar';
import checkSpeechRecognitionSupport from '@/utils/browser';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';
import getVoiceSearchErrorInfo from '@/utils/voice-search';

type Props = {
  placeholder?: string;
  initialSearchQuery?: string;
  shouldExpandOnClick?: boolean;
  shouldOpenDrawerOnMobile?: boolean;
};

/**
 * Search input component with voice search capability
 *
 * @returns {JSX.Element} The search input component
 */
const SearchInput: React.FC<Props> = ({
  placeholder,
  initialSearchQuery,
  shouldExpandOnClick = false,
  shouldOpenDrawerOnMobile = false,
}) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const router = useRouter();
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState<boolean>(false);
  const {
    searchQuery,
    setSearchQuery,
    hasSearchResults,
    setHasSearchResults,
    inputRef,
    keepSearchResultsVisible,
    onSearchQueryChange,
    onClearClicked,
  } = useSearchWithVoice(initialSearchQuery, false);

  const isExpanded = useSelector(selectIsExpanded);
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const voiceSearchRef = useRef<VoiceSearchRef>(null);

  // Handle microphone permission errors
  const handleMicError = useCallback(
    (error: Error) => {
      const { key, fallback } = getVoiceSearchErrorInfo(error.message);
      toast(t(key, { fallback }), { status: ToastStatus.Error });
    },
    [toast, t],
  );

  // Check if speech recognition is supported
  useEffect(() => {
    setIsSpeechRecognitionSupported(checkSpeechRecognitionSupport());
  }, []);

  // Handle clear button click - stop microphone if active
  const handleClearClick = useCallback(() => {
    // Stop the microphone if it's active
    if (voiceSearchRef.current) {
      voiceSearchRef.current.stopMicrophone();
    }

    // Call the original clear function
    onClearClicked();

    // Log the click
    logButtonClick('search_input_clear_query');

    // Keep the dropdown visible after clearing
    if (shouldExpandOnClick) {
      keepSearchResultsVisible();
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  }, [onClearClicked, shouldExpandOnClick, keepSearchResultsVisible, dispatch]);

  // Effect to stop microphone when search results are received
  useEffect(() => {
    // If we have search results and the voice search ref is available, stop the microphone
    if (hasSearchResults && voiceSearchRef.current) {
      voiceSearchRef.current.stopMicrophone();
    }
  }, [hasSearchResults]);

  // Ensure expansion works correctly regardless of voice search support
  useEffect(() => {
    // If we have a search query, make sure the results are visible
    if (searchQuery && searchQuery.trim() !== '') {
      keepSearchResultsVisible();
    }
  }, [searchQuery, keepSearchResultsVisible]);

  const collapseContainer = useCallback(() => {
    // Always collapse when clicking outside, regardless of hasSearchResults
    dispatch({ type: setIsExpanded.type, payload: false });

    // Reset hasSearchResults when clicking outside
    setHasSearchResults(false);
  }, [dispatch, setHasSearchResults]);

  useOutsideClickDetector(containerRef, collapseContainer, isExpanded || hasSearchResults);
  useHotkeys('Escape', collapseContainer, {
    enabled: isExpanded || hasSearchResults,
    enableOnFormTags: ['INPUT'],
  });

  const onInputClick = useCallback(() => {
    const shouldSearchBeInSearchDrawer = shouldOpenDrawerOnMobile && isMobile();

    if (shouldSearchBeInSearchDrawer) {
      dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    } else if (shouldExpandOnClick) {
      // Always keep search results visible when clicking on the input
      // regardless of voice search support
      keepSearchResultsVisible();

      // Explicitly set isExpanded to true to ensure the dropdown shows
      dispatch({ type: setIsExpanded.type, payload: true });

      // Set hasSearchResults to true to ensure the dropdown shows
      setHasSearchResults(true);
    }
  }, [
    shouldOpenDrawerOnMobile,
    dispatch,
    shouldExpandOnClick,
    keepSearchResultsVisible,
    setHasSearchResults,
  ]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery) {
        router.push(getSearchQueryNavigationUrl(searchQuery), undefined, { shallow: true });
        keepSearchResultsVisible();
      }
    },
    [searchQuery, router, keepSearchResultsVisible],
  );

  return (
    <div
      ref={containerRef}
      className={classNames(styles.headerOuterContainer, {
        [styles.expanded]: isExpanded || hasSearchResults,
      })}
    >
      <div className={styles.inputContainer}>
        <form onSubmit={onSubmit} className={styles.form}>
          <Input
            onClick={onInputClick}
            id="searchQuery"
            onChange={onSearchQueryChange}
            value={searchQuery}
            placeholder={placeholder}
            onClearClicked={handleClearClick}
            clearable
            prefix={<SearchIcon />}
            suffix={
              isSpeechRecognitionSupported ? (
                <VoiceSearch
                  ref={voiceSearchRef}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  inputRef={inputRef}
                  onError={handleMicError}
                  shouldOpenDrawerOnMobile={shouldOpenDrawerOnMobile}
                />
              ) : null
            }
            prefixSuffixContainerClassName={styles.prefixSuffixContainer}
            containerClassName={styles.input}
            htmlType="search"
            enterKeyHint="search"
            shouldUseDefaultStyles={false}
            fixedWidth={false}
            size={InputSize.Large}
          />
        </form>
      </div>
      {(isExpanded || hasSearchResults) && (
        <div className={styles.dropdownContainer}>
          <ExpandedSearchInputSection
            searchQuery={searchQuery}
            onResetSearchResults={() => setHasSearchResults(false)}
          />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
