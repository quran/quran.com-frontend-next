import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './NoResults.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import IconSearch from '@/icons/search.svg';
import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  searchQuery: string;
  shouldSuggestFullSearchWhenNoResults?: boolean;
  onResetSearchResults?: () => void;
}

const NoResults: React.FC<Props> = ({
  searchQuery,
  shouldSuggestFullSearchWhenNoResults = false,
  onResetSearchResults,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();

  if (shouldSuggestFullSearchWhenNoResults) {
    return (
      <Link
        href={getSearchQueryNavigationUrl(searchQuery)}
        shouldPassHref
        onClick={(e) => {
          // Prevent default navigation
          e.preventDefault();

          logButtonClick('no_results_advanced_search_link');

          // Close the command bar when navigating to the search page
          dispatch({ type: setIsExpanded.type, payload: false });

          // Reset hasSearchResults state to ensure the dropdown doesn't stay open
          if (onResetSearchResults) {
            onResetSearchResults();
          }

          // Navigate programmatically after state updates
          router.replace(getSearchQueryNavigationUrl(searchQuery));
        }}
        variant={LinkVariant.Blend}
      >
        {t('search-for', {
          searchQuery,
        })}
      </Link>
    );
  }
  return (
    <>
      <div className={styles.container}>
        <div className={styles.mainBody}>
          <div className={styles.iconContainer}>
            <IconSearch />
          </div>
          <p className={styles.mainMessage}>{t('search.no-results')}</p>
          <p className={styles.secondaryMessage}>
            {t('search.no-results-suggestion', { searchQuery })}
          </p>
        </div>
      </div>
    </>
  );
};

export default NoResults;
