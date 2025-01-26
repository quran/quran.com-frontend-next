import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './SearchInput.module.scss';

import ExpandedSearchInputSection from '@/components/Search/CommandBar/ExpandedSearchInputSection';
import TarteelVoiceSearchTrigger from '@/components/TarteelVoiceSearch/Trigger';
import Input, { InputSize } from '@/dls/Forms/Input';
import KeyboardInput from '@/dls/KeyboardInput';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import SearchIcon from '@/icons/search.svg';
import { selectIsExpanded, setIsExpanded } from '@/redux/slices/CommandBar/state';
import { setIsSearchDrawerOpen, setDisableSearchDrawerTransition } from '@/redux/slices/navbar';
import {
  selectIsCommandBarVoiceFlowStarted,
  startSearchDrawerVoiceFlow,
  stopCommandBarVoiceFlow,
} from '@/redux/slices/voiceSearch';
import { logButtonClick } from '@/utils/eventLogger';
import { isMobile } from '@/utils/responsive';

type Props = {
  placeholder?: string;
  initialSearchQuery?: string;
  shouldExpandOnClick?: boolean;
  shouldOpenDrawerOnMobile?: boolean;
};

const SearchInput: React.FC<Props> = ({
  placeholder,
  initialSearchQuery,
  shouldExpandOnClick = false,
  shouldOpenDrawerOnMobile = false,
}) => {
  const isVoiceSearchFlowStarted = useSelector(selectIsCommandBarVoiceFlowStarted, shallowEqual);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const isExpanded = useSelector(selectIsExpanded);
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const collapseContainer = useCallback(() => {
    dispatch({ type: setIsExpanded.type, payload: false });
    dispatch({ type: stopCommandBarVoiceFlow.type, payload: false });
  }, [dispatch]);
  useOutsideClickDetector(containerRef, collapseContainer, isExpanded);
  useHotkeys('Escape', collapseContainer, { enabled: isExpanded, enableOnFormTags: ['INPUT'] });

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  /**
   * Handle when the search query is changed.
   *
   * @param {string} newSearchQuery
   * @returns {void}
   */
  const onSearchQueryChange = (newSearchQuery: string): void => {
    setSearchQuery(newSearchQuery);
    dispatch({ type: setIsExpanded.type, payload: !!newSearchQuery });
  };

  const onClearClicked = () => {
    logButtonClick('search_input_clear_query');
    setSearchQuery('');
  };

  const shouldSearchBeInSearchDrawer = shouldOpenDrawerOnMobile && isMobile();
  const onTarteelTriggerClicked = (startFlow: boolean) => {
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `search_input_voice_search_${startFlow ? 'start' : 'stop'}_flow`,
    );
    if (shouldSearchBeInSearchDrawer) {
      dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
      dispatch({ type: startSearchDrawerVoiceFlow.type, payload: false });
    } else {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  };

  const onInputClick = () => {
    if (shouldSearchBeInSearchDrawer) {
      dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    } else if (shouldExpandOnClick) {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.headerOuterContainer, { [styles.expanded]: isExpanded })}
    >
      <div className={styles.inputContainer}>
        <Input
          onClick={onInputClick}
          id="searchQuery"
          disabled={isVoiceSearchFlowStarted}
          onChange={onSearchQueryChange}
          value={searchQuery}
          placeholder={placeholder}
          onClearClicked={onClearClicked}
          clearable
          prefix={<SearchIcon />}
          prefixSuffixContainerClassName={styles.prefixSuffixContainer}
          containerClassName={styles.input}
          suffix={
            <>
              <KeyboardInput meta keyboardKey="K" />
              <TarteelVoiceSearchTrigger isCommandBar onClick={onTarteelTriggerClicked} />
            </>
          }
          shouldUseDefaultStyles={false}
          fixedWidth={false}
          size={InputSize.Large}
        />
      </div>
      {isExpanded && (
        <div className={styles.dropdownContainer}>
          <ExpandedSearchInputSection searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
