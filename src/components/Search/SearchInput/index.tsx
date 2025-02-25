import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDispatch, useSelector } from 'react-redux';

import styles from './SearchInput.module.scss';

import ExpandedSearchInputSection from '@/components/Search/CommandBar/ExpandedSearchInputSection';
import Input, { InputSize } from '@/dls/Forms/Input';
import useOutsideClickDetector from '@/hooks/useOutsideClickDetector';
import SearchIcon from '@/icons/search.svg';
import { selectIsExpanded, setIsExpanded } from '@/redux/slices/CommandBar/state';
import { setIsSearchDrawerOpen, setDisableSearchDrawerTransition } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const isExpanded = useSelector(selectIsExpanded);
  const dispatch = useDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const collapseContainer = useCallback(() => {
    dispatch({ type: setIsExpanded.type, payload: false });
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

  const onInputClick = () => {
    if (shouldSearchBeInSearchDrawer) {
      dispatch({ type: setDisableSearchDrawerTransition.type, payload: true });
      dispatch({ type: setIsSearchDrawerOpen.type, payload: true });
    } else if (shouldExpandOnClick) {
      dispatch({ type: setIsExpanded.type, payload: true });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(getSearchQueryNavigationUrl(searchQuery));
    }
  };

  return (
    <div
      ref={containerRef}
      className={classNames(styles.headerOuterContainer, { [styles.expanded]: isExpanded })}
    >
      <div className={styles.inputContainer}>
        <form onSubmit={onSubmit} className={styles.form}>
          <Input
            onClick={onInputClick}
            id="searchQuery"
            onChange={onSearchQueryChange}
            value={searchQuery}
            placeholder={placeholder}
            onClearClicked={onClearClicked}
            clearable
            prefix={<SearchIcon />}
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
      {isExpanded && (
        <div className={styles.dropdownContainer}>
          <ExpandedSearchInputSection searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};

export default SearchInput;
