import { useState, useMemo, useEffect, useContext } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import VerseListItem from './VerseListItem';

import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logEmptySearchResults, logTextSearchQuery } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const chapterIds = useChapterIdsByUrlPath(lang);
  const urlChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;

  const [currentChapterId, setCurrentChapterId] = useState(urlChapterId);

  useEffect(() => {
    setCurrentChapterId(lastReadVerseKey.chapterId);
  }, [lastReadVerseKey]);

  useEffect(() => {
    // when the user navigates to a new chapter, reset the search query, and update the current chapter id
    setSearchQuery('');
    setCurrentChapterId(urlChapterId);
  }, [urlChapterId]);

  const verseKeys = useMemo(
    () => (currentChapterId ? generateChapterVersesKeys(chaptersData, currentChapterId) : []),
    [chaptersData, currentChapterId],
  );

  const filteredVerseKeys = verseKeys.filter((verseKey) => {
    const verseNumber = getVerseNumberFromKey(verseKey);
    const localizedVerseNumber = toLocalizedNumber(verseNumber, lang);
    return (
      localizedVerseNumber.toString().startsWith(searchQuery) ||
      verseNumber.toString().startsWith(searchQuery)
    );
  });

  useEffect(() => {
    if (!filteredVerseKeys.length) {
      logEmptySearchResults({
        query: searchQuery,
        source: SearchQuerySource.SidebarNavigationVersesList,
      });
    } else {
      logTextSearchQuery(searchQuery, SearchQuerySource.SidebarNavigationVersesList);
    }
  }, [searchQuery, filteredVerseKeys]);

  // Handle when user press `Enter` in input box
  const handleVerseInputSubmit = (e) => {
    e.preventDefault();
    const firstFilteredVerseKey = filteredVerseKeys[0];
    if (firstFilteredVerseKey) {
      router.push(getChapterWithStartingVerseUrl(firstFilteredVerseKey), undefined, {
        shallow: true, // https://nextjs.org/docs/routing/shallow-routing
      });
    }
  };

  return (
    <div className={styles.verseListContainer}>
      <form onSubmit={handleVerseInputSubmit}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          placeholder={t('verse')}
        />
      </form>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredVerseKeys.map((verseKey) => {
            return <VerseListItem verseKey={verseKey} key={verseKey} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default VerseList;
