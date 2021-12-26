import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';

import TrendUpIcon from '../../../../public/icons/trend-up.svg';

import Header from './Header';
import styles from './PreInput.module.scss';
import SearchItem from './SearchItem';
import SearchQuerySuggestion from './SearchQuerySuggestion';

import SearchHistory from 'src/components/Search/SearchHistory';
import { logButtonClick } from 'src/utils/eventLogger';
import { getSurahNavigationUrl } from 'src/utils/navigation';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  isSearchDrawer: boolean;
}

// TODO: localize this after deciding the roadmap for json files
const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };
const SEARCH_FOR_KEYWORDS = ['Juz 1', 'Page 1', 'Surah Yasin', '36', '2:255'];

const PreInput: React.FC<Props> = ({ onSearchKeywordClicked, isSearchDrawer }) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div>
        <Header text={t('search.popular')} />
        <div>
          {Object.keys(POPULAR_SEARCH_QUERIES).map((popularSearchQuery) => {
            const url = getSurahNavigationUrl(POPULAR_SEARCH_QUERIES[popularSearchQuery]);
            return (
              <Link href={url} key={url}>
                <a className={styles.popularSearchItem}>
                  <SearchItem
                    prefix={<TrendUpIcon />}
                    title={popularSearchQuery}
                    url={url}
                    key={url}
                    onClick={() => {
                      logButtonClick(
                        `search_${
                          isSearchDrawer ? 'drawer' : 'page'
                        }_popular_search_${popularSearchQuery}`,
                      );
                    }}
                  />
                </a>
              </Link>
            );
          })}
        </div>
        <SearchHistory
          onSearchKeywordClicked={onSearchKeywordClicked}
          isSearchDrawer={isSearchDrawer}
        />
        <Header text={t('search.hint')} />
        {SEARCH_FOR_KEYWORDS.map((keyword, index) => (
          <SearchQuerySuggestion
            searchQuery={keyword}
            key={keyword}
            onSearchKeywordClicked={(searchQuery: string) => {
              logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_search_hint_${index}`);
              onSearchKeywordClicked(searchQuery);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PreInput;
