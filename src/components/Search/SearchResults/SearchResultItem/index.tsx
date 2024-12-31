/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import SearchResultItemIcon from '../SearchResultItemIcon';

import styles from './SearchResultItem.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import { SearchNavigationResult } from '@/types/Search/SearchNavigationResult';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getResultType, getSearchNavigationResult } from '@/utils/search';

interface Props {
  source: SearchQuerySource;
  service: SearchService;
  result: SearchNavigationResult;
}

const SearchResultItem: React.FC<Props> = ({ source, service, result }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const type = getResultType(result);
  const onResultItemClicked = () => {
    logButtonClick(`search_result_item`, {
      service,
      source,
    });
  };

  const {
    name,
    key: resultKey,
    isArabic,
  } = getSearchNavigationResult(chaptersData, result, t, lang);

  const url = resolveUrlBySearchNavigationType(type, resultKey, true);
  return (
    <div className={styles.container} translate="no">
      <Link href={url} onClick={onResultItemClicked} className={styles.linkContainer}>
        <div className={styles.iconContainer}>
          <SearchResultItemIcon type={type} />
        </div>
        <div
          className={classNames(styles.resultText, {
            [styles.arabic]: isArabic,
          })}
          dangerouslySetInnerHTML={{
            __html: `${name}`,
          }}
        />
      </Link>
    </div>
  );
};
export default SearchResultItem;
