import { useState, useMemo, useEffect, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import VerseListItem from './VerseListItem';

import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { logEmptySearchResults } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const currentChapterId = lastReadVerseKey.chapterId;
  const router = useRouter();

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
      logEmptySearchResults(searchQuery, 'sidebar_navigation_verse_list');
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
