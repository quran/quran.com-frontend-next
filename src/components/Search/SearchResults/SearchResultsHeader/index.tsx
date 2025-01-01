import React from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './SearchResultsHeader.module.scss';

import IconContainer from '@/dls/IconContainer/IconContainer';
import NavigateIcon from '@/icons/east.svg';
import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { getSearchQueryNavigationUrl } from '@/utils/navigation';

type Props = {
  searchQuery: string;
  onSearchResultClicked?: () => void;
  source: SearchQuerySource;
};

const SearchResultsHeader: React.FC<Props> = ({ searchQuery, onSearchResultClicked, source }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const onNavigationLinkClicked = () => {
    router.push(getSearchQueryNavigationUrl(searchQuery)).then(() => {
      dispatch({ type: setIsExpanded.type, payload: false });
      if (onSearchResultClicked) {
        onSearchResultClicked();
      }
      logButtonClick(`${source}_show_all`);
    });
  };
  return (
    <div className={styles.resultsSummaryContainer}>
      <p className={styles.resultsSummary}>{t('common:search-results-no-count')}</p>
      <div
        role="button"
        onClick={onNavigationLinkClicked}
        tabIndex={0}
        onKeyDown={onNavigationLinkClicked}
      >
        <div className={styles.moreResultsContainer}>
          <p className={styles.showAll}>{t('common:search.more-results')}</p>
          <span className={styles.commandPrefix}>
            <IconContainer shouldFlipOnRTL icon={<NavigateIcon />} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;
