import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SearchAndFilters.module.scss';

import SortIcon from '@/icons/arrows-vertical.svg';
import FilterIcon from '@/icons/filter.svg';
import PlusIcon from '@/icons/plus.svg';
import SearchIcon from '@/icons/search.svg';

export interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick?: () => void;
  onSortClick?: () => void;
  onAddNewClick?: () => void;
  placeholder?: string;
  showSearchBar?: boolean;
  showFilterButton?: boolean;
  showSortButton?: boolean;
  showAddNewButton?: boolean;
  hasActiveFilters?: boolean;
  hasActiveSort?: boolean;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  onSortClick,
  onAddNewClick,
  placeholder,
  showSearchBar = true,
  showFilterButton = true,
  showSortButton = true,
  showAddNewButton = false,
  hasActiveFilters = false,
  hasActiveSort = false,
}) => {
  const { t } = useTranslation('my-quran');

  return (
    <div className={styles.container}>
      {showSearchBar && (
        <div className={styles.searchContainer}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={placeholder || t('search.placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={t('search.placeholder')}
          />
        </div>
      )}
      <div className={styles.controls}>
        {showAddNewButton && (
          <button
            type="button"
            className={styles.addNewButton}
            onClick={onAddNewClick}
            aria-label={t('collections.new-collection')}
          >
            <PlusIcon className={styles.controlIcon} />
            <span className={styles.controlText}>{t('collections.new-collection')}</span>
          </button>
        )}
        {showFilterButton && (
          <button
            type="button"
            className={styles.controlButton}
            onClick={onFilterClick}
            aria-label={t('search.filter')}
          >
            <FilterIcon className={styles.controlIcon} />
            <span className={styles.controlText}>{t('search.filter')}</span>
            {hasActiveFilters && <span className={styles.activeDot} />}
          </button>
        )}
        {showSortButton && (
          <button
            type="button"
            className={styles.controlButton}
            onClick={onSortClick}
            aria-label={t('search.sort')}
          >
            <SortIcon className={styles.controlIcon} />
            <span className={styles.controlText}>{t('search.sort')}</span>
            {hasActiveSort && <span className={styles.activeDot} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;
