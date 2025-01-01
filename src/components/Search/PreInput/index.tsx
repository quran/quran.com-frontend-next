import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Header from './Header';
import styles from './PreInput.module.scss';
import SearchItem from './SearchItem';
import SearchQuerySuggestion from './SearchQuerySuggestion';

import SearchHistory from '@/components/Search/SearchHistory';
import Link from '@/dls/Link/Link';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import TrendUpIcon from '@/icons/trend-up.svg';
import { SearchNavigationType } from '@/types/Search/SearchNavigationResult';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  source: SearchQuerySource;
}

const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };

const PreInput: React.FC<Props> = ({ onSearchKeywordClicked, source }) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useGetChaptersData(lang);
  if (!chaptersData) {
    return <></>;
  }

  const SEARCH_FOR_KEYWORD = [
    {
      type: SearchNavigationType.JUZ,
      value: `${t('juz')} ${toLocalizedNumber(1, lang)}`,
    },
    {
      type: SearchNavigationType.PAGE,
      value: `${t('page')} ${toLocalizedNumber(1, lang)}`,
    },
    {
      type: SearchNavigationType.SURAH,
      value: getChapterData(chaptersData, '36').transliteratedName,
    },
    {
      type: SearchNavigationType.SURAH,
      value: toLocalizedNumber(36, lang),
    },
    {
      type: SearchNavigationType.AYAH,
      value: toLocalizedVerseKey('2:255', lang),
    },
  ];
  return (
    <div className={styles.container}>
      <div>
        <Header text={t('search.popular')} />
        <div>
          {Object.keys(POPULAR_SEARCH_QUERIES).map((popularSearchQuery) => {
            const chapterId = POPULAR_SEARCH_QUERIES[popularSearchQuery];
            const url = getSurahNavigationUrl(POPULAR_SEARCH_QUERIES[popularSearchQuery]);
            const chapterData = getChapterData(chaptersData, chapterId);
            return (
              <Link href={url} key={url} className={styles.popularSearchItem}>
                <SearchItem
                  prefix={<TrendUpIcon />}
                  title={chapterData.transliteratedName}
                  key={url}
                  onClick={() => {
                    logButtonClick(`${source}_popular_search_${popularSearchQuery}`);
                  }}
                />
              </Link>
            );
          })}
        </div>
        <SearchHistory onSearchKeywordClicked={onSearchKeywordClicked} source={source} />
        <Header text={t('search.hint')} />
        {SEARCH_FOR_KEYWORD.map((keyword, index) => {
          return (
            <SearchQuerySuggestion
              searchQuery={keyword.value}
              type={keyword.type}
              key={keyword.value}
              onSearchKeywordClicked={(searchQuery: string) => {
                logButtonClick(`${source}_search_hint_${index}`);
                onSearchKeywordClicked(searchQuery);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PreInput;
