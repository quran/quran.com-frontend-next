import React, { useCallback, useRef, useState, useEffect } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchInput.module.scss';

import ExpandedSearchInputSection from '@/components/Search/CommandBar/ExpandedSearchInputSection';
import VoiceSearch from '@/components/Search/VoiceSearch';
import Input, { InputSize } from '@/dls/Forms/Input';
import { useToast } from '@/dls/Toast/Toast';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import useSearchWithVoice from '@/hooks/useSearchWithVoice';
import SearchIcon from '@/icons/search.svg';
import { selectIsExpanded, setIsExpanded } from '@/redux/slices/CommandBar/state';
import { setIsSearchDrawerOpen, setDisableSearchDrawerTransition } from '@/redux/slices/navbar';
import checkSpeechRecognitionSupport from '@/utils/browser';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';
import { isMobile } from '@/utils/responsive';
import { useHandleMicError } from '@/utils/voice-search-errors';

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
  const { searchQuery, setSearchQuery, inputRef, onSearchQueryChange, onClearClicked } =
    useSearchWithVoice(initialSearchQuery, false);

  const isExpanded = useSelector(selectIsExpanded);
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSearchQuery = Boolean(searchQuery?.length);

  // Handle microphone permission errors
  const handleMicError = useHandleMicError(toast, t);

  // Check if speech recognition is supported
  useEffect(() => {
    setIsSpeechRecognitionSupported(checkSpeechRecognitionSupport());
  }, []);

  // Custom search query change handler that also expands the dropdown
  const handleSearchQueryChange = useCallback(
    (newSearchQuery: string) => {
      onSearchQueryChange(newSearchQuery);

      // Auto-expand dropdown when user starts typing (if shouldExpandOnClick is true)
      if (shouldExpandOnClick && newSearchQuery?.length > 0 && !isExpanded) {
        dispatch({ type: setIsExpanded.type, payload: true });
      }
    },
    [onSearchQueryChange, shouldExpandOnClick, isExpanded, dispatch],
  );

  const collapseContainer = useCallback(() => {
    // Always collapse when clicking outside, regardless of hasSearchResults
    dispatch({ type: setIsExpanded.type, payload: false });
  }, [dispatch]);

  useOutsideClickDetector(containerRef, collapseContainer, isExpanded);
  useHotkeys('Escape', collapseContainer, {
    enabled: isExpanded,
    enableOnFormTags: ['INPUT'],
  });

  const handleClearClicked = () => {
    logButtonClick('search_input_clear_query');
    onClearClicked();

    // Keep the dropdown visible after clearing
    if (shouldExpandOnClick) {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  };

  const shouldSearchBeInSearchDrawer = shouldOpenDrawerOnMobile && isMobile();

  const onInputClick = () => {
    if (shouldSearchBeInSearchDrawer) {
      dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    } else if (shouldExpandOnClick) {
      // Explicitly set isExpanded to true to ensure the dropdown shows
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(getSearchQueryNavigationUrl(searchQuery), undefined, { shallow: true });
      // Close the dropdown after navigation
      dispatch({ type: setIsExpanded.type, payload: false });
    }
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.headerOuterContainer, {
        [styles.expanded]: isExpanded && hasSearchQuery,
      })}
    >
      <div className={styles.inputContainer}>
        <form onSubmit={onSubmit} className={styles.form}>
          <Input
            onClick={onInputClick}
            id="searchQuery"
            onChange={handleSearchQueryChange}
            value={searchQuery}
            placeholder={placeholder}
            onClearClicked={handleClearClicked}
            clearable
            prefix={<SearchIcon />}
            suffix={
              isSpeechRecognitionSupported ? (
                <VoiceSearch
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  inputRef={inputRef}
                  onError={handleMicError}
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
      {isExpanded && hasSearchQuery && (
        <div className={styles.dropdownContainer} data-testid="search-results">
          <ExpandedSearchInputSection searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
