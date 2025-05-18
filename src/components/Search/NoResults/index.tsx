import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NoResults.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';
import IconSearch from '@/icons/search.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

interface Props {
  searchQuery: string;
  shouldSuggestFullSearchWhenNoResults?: boolean;
}

const NoResults: React.FC<Props> = ({
  searchQuery,
  shouldSuggestFullSearchWhenNoResults = false,
}) => {
  const { t } = useTranslation('common');
  if (shouldSuggestFullSearchWhenNoResults) {
    return (
      <Link
        href={getSearchQueryNavigationUrl(searchQuery)}
        shouldPassHref
        onClick={() => {
          logButtonClick('no_results_advanced_search_link');
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
