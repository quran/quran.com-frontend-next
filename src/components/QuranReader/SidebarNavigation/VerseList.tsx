import { useState, useMemo, useEffect, useContext } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';
import VerseListItem from './VerseListItem';

import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick, logEmptySearchResults, logTextSearchQuery } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

type Props = {
  onAfterNavigationItemRouted?: () => void;
};

const VerseList: React.FC<Props> = ({ onAfterNavigationItemRouted }) => {
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

  const navigateAndHandleAfterNavigation = (href: string) => {
    router
      .push(href, undefined, {
        shallow: true, // preserve the shallow routing option
      })
      .then(() => {
        if (onAfterNavigationItemRouted) {
          onAfterNavigationItemRouted();
        }
      });
  };

  // Handle when user press `Enter` in input box
  const handleVerseInputSubmit = (e) => {
    e.preventDefault();
    const firstFilteredVerseKey = filteredVerseKeys[0];
    if (firstFilteredVerseKey) {
      const href = getChapterWithStartingVerseUrl(firstFilteredVerseKey);
      navigateAndHandleAfterNavigation(href);
    }
  };

  const handleVerseClick = (e: React.MouseEvent, verseKey: string) => {
    e.preventDefault();
    const href = getChapterWithStartingVerseUrl(verseKey);
    navigateAndHandleAfterNavigation(href);
    logButtonClick(`navigation_list_verse`, {
      verseKey,
    });
  };

  const onSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.verseListContainer}>
      <form onSubmit={handleVerseInputSubmit}>
        <input
          value={searchQuery}
          onChange={onSearchQueryChange}
          className={styles.searchInput}
          placeholder={t('sidebar.search-verse')}
        />
      </form>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredVerseKeys.map((verseKey) => (
            <VerseListItem
              verseKey={verseKey}
              key={verseKey}
              onVerseClick={(e) => handleVerseClick(e, verseKey)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerseList;
