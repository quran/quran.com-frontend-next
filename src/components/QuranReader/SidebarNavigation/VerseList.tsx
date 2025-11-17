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
  selectedChapterId?: string;
};

const VerseList: React.FC<Props> = ({ onAfterNavigationItemRouted, selectedChapterId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const chapterIds = useChapterIdsByUrlPath(lang);
  const urlChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;

  // Use the provided selectedChapterId if available, otherwise use URL or fallback logic
  const [currentChapterId, setCurrentChapterId] = useState<string>(
    selectedChapterId || urlChapterId || '1',
  );

  useEffect(() => {
    // If selectedChapterId is provided externally, use it
    if (selectedChapterId) {
      setCurrentChapterId(selectedChapterId);
    } else if (lastReadVerseKey.chapterId) {
      setCurrentChapterId(lastReadVerseKey.chapterId);
    } else if (!currentChapterId) {
      // If no chapter is selected, default to chapter 1
      setCurrentChapterId('1');
    }
  }, [lastReadVerseKey, currentChapterId, selectedChapterId]);

  useEffect(() => {
    // when the user navigates to a new chapter, reset the search query, and update the current chapter id
    setSearchQuery('');
    if (!selectedChapterId) {
      setCurrentChapterId(urlChapterId || currentChapterId || '1');
    }
  }, [urlChapterId, currentChapterId, selectedChapterId]);

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
        shallow: false, // Change to false to force a full page reload
      })
      .then(() => {
        if (onAfterNavigationItemRouted) {
          onAfterNavigationItemRouted();
        }
      })
      .catch(() => {
        // As a fallback, we can use window.location
        window.location.href = href;
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
          placeholder={t('verse')}
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
