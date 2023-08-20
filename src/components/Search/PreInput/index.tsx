/* eslint-disable react-func/max-lines-per-function */
import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import Header from './Header';
import styles from './PreInput.module.scss';
import SearchItem from './SearchItem';
import SearchQuerySuggestion from './SearchQuerySuggestion';

import SearchHistory from '@/components/Search/SearchHistory';
import Link from '@/dls/Link/Link';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import RepeatIcon from '@/icons/repeat.svg';
import TrendUpIcon from '@/icons/trend-up.svg';
import { selectCustomSelection, selectSurahLogs } from '@/redux/slices/QuranReader/readingTracker';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';
import { getRandomAll } from '@/utils/random';

interface Props {
  onSearchKeywordClicked: (searchQuery: string) => void;
  isSearchDrawer: boolean;
}

const POPULAR_SEARCH_QUERIES = { Mulk: 67, Noah: 71, Kahf: 18, Yaseen: 36 };

const PreInput: React.FC<Props> = ({ onSearchKeywordClicked, isSearchDrawer }) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useGetChaptersData(lang);
  const surahLogs = useSelector(selectSurahLogs, shallowEqual);
  const customSelection = useSelector(selectCustomSelection, shallowEqual);

  const SEARCH_FOR_KEYWORDS = useMemo(() => {
    if (!chaptersData) return [];
    return [
      `${t('juz')} ${toLocalizedNumber(1, lang)}`,
      `${t('page')} ${toLocalizedNumber(1, lang)}`,
      getChapterData(chaptersData, '36').transliteratedName,
      toLocalizedNumber(36, lang),
      toLocalizedVerseKey('2:255', lang),
    ];
  }, [chaptersData, lang, t]);

  /**
   * This is the list of commands shown in the pre-input view that picks random surahs/ayahs
   *
   * We need to memoize this list so that it is not re-generated on every re-render.
   * We should only need it to generate the random keys once each time the command bar opens.
   */
  const PICK_RANDOM = useMemo(() => {
    if (!chaptersData) return [];

    const {
      randomSurahId,
      randomSurahAyahId,
      randomReadSurahId,
      randomReadSurahAyahId,

      randomSurah,
      randomSurahAyah,
      randomReadSurah,
      randomReadSurahAyah,
    } = getRandomAll(chaptersData, customSelection || surahLogs, t('verse').toLowerCase());

    return [
      {
        title: t('random.any-surah'),
        url: randomSurahId,
        surahName: randomSurah,
      },
      {
        title: t('random.any-ayah'),
        url: randomSurahAyahId.replace(':', '?startingVerse='),
        surahName: randomSurahAyah,
      },
      {
        title: t('random.selected-surah'),
        url: randomReadSurahId,
        surahName: randomReadSurah,
      },
      {
        title: t('random.selected-ayah'),
        url: randomReadSurahAyahId.replace(':', '?startingVerse='),
        surahName: randomReadSurahAyah,
      },
      {
        title: t('random.edit'),
        url: 'random',
        surahName: 'random_page',
      },
    ];
  }, [chaptersData, customSelection, surahLogs, t]);

  if (!chaptersData) {
    return <></>;
  }

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
              </Link>
            );
          })}
        </div>
        <SearchHistory
          onSearchKeywordClicked={onSearchKeywordClicked}
          isSearchDrawer={isSearchDrawer}
        />
        <Header text={t('search.random')} />
        {PICK_RANDOM.map(({ url, title, surahName }) => {
          return (
            <Link href={url} key={url} className={styles.popularSearchItem}>
              <SearchItem
                prefix={<RepeatIcon />}
                title={title}
                url={url}
                key={url}
                onClick={() => {
                  logButtonClick(
                    `search_${isSearchDrawer ? 'drawer' : 'page'}_random_search_${surahName}`,
                  );
                }}
              />
            </Link>
          );
        })}
        <Header text={t('search.hint')} />
        {SEARCH_FOR_KEYWORDS.map((keyword, index) => {
          return (
            <SearchQuerySuggestion
              searchQuery={keyword}
              key={keyword}
              onSearchKeywordClicked={(searchQuery: string) => {
                logButtonClick(`search_${isSearchDrawer ? 'drawer' : 'page'}_search_hint_${index}`);
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
