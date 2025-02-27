/* eslint-disable max-lines */
import { useContext, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from '@/dls/Link/Link';
import useChapterIdsByUrlPath from '@/hooks/useChapterId';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from '@/hooks/useScrollToElement';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import { selectIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logEmptySearchResults, logTextSearchQuery } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getSurahNavigationUrl } from '@/utils/navigation';
import REVELATION_ORDER from '@/utils/revelationOrder';
import DataContext from 'src/contexts/DataContext';
import Chapter from 'types/Chapter';

const filterSurah = (surahs: Chapter[], searchQuery: string) => {
  const fuse = new Fuse(surahs, {
    threshold: 0.3,
    keys: ['id', 'localizedId', 'transliteratedName'],
  });

  const filteredSurah = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredSurah.length) {
    logEmptySearchResults({
      query: searchQuery,
      source: SearchQuerySource.SidebarNavigationChaptersList,
    });
  } else {
    logTextSearchQuery(searchQuery, SearchQuerySource.SidebarNavigationChaptersList);
  }

  return filteredSurah as Chapter[];
};

type Props = {
  onAfterNavigationItemRouted?: () => void;
  customChapterSelectHandler?: (chapterId: string) => void;
  shouldDisableNavigation?: boolean;
  selectedChapterId?: string;
};

const SurahList: React.FC<Props> = ({
  onAfterNavigationItemRouted,
  customChapterSelectHandler,
  shouldDisableNavigation = false,
  selectedChapterId: externalSelectedChapterId,
}) => {
  const { t, lang } = useTranslation('common');
  const lastReadVerseKey = useSelector(selectLastReadVerseKey);
  const isReadingByRevelationOrder = useSelector(selectIsReadingByRevelationOrder);
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const chapterIds = useChapterIdsByUrlPath(lang);
  const urlChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;

  // Use external selectedChapterId if provided, otherwise use internal state
  const [internalCurrentChapterId, setInternalCurrentChapterId] = useState(urlChapterId);
  const currentChapterId = externalSelectedChapterId || internalCurrentChapterId;

  useEffect(() => {
    if (!externalSelectedChapterId) {
      setInternalCurrentChapterId(lastReadVerseKey.chapterId);
    }
  }, [lastReadVerseKey, externalSelectedChapterId]);

  useEffect(() => {
    // when the user navigates to a new chapter, update the current chapter id
    if (!externalSelectedChapterId) {
      setInternalCurrentChapterId(urlChapterId);
    }
  }, [urlChapterId, externalSelectedChapterId]);

  const [searchQuery, setSearchQuery] = useState('');

  const chapterDataArray = useMemo(() => {
    if (!isReadingByRevelationOrder) {
      return Object.entries(chaptersData).map(([id, chapter]) => {
        return {
          ...chapter,
          id,
          localizedId: toLocalizedNumber(Number(id), lang),
        };
      });
    }

    // Sort the chapters by revelation order
    return Object.entries(chaptersData)
      .map(([id, chapter]) => {
        return {
          ...chapter,
          id,
          localizedId: toLocalizedNumber(Number(REVELATION_ORDER.indexOf(Number(id)) + 1), lang),
        };
      })
      .sort(
        (a, b) => REVELATION_ORDER.indexOf(Number(a.id)) - REVELATION_ORDER.indexOf(Number(b.id)),
      );
  }, [isReadingByRevelationOrder, chaptersData, lang]);

  const filteredChapters = searchQuery
    ? filterSurah(chapterDataArray, searchQuery)
    : chapterDataArray;

  const [scrollTo, selectedChapterRef] =
    useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);

  useEffect(() => {
    scrollTo();
  }, [currentChapterId, scrollTo]);

  const navigateAndHandleAfterNavigation = (href: string) => {
    router.push(href).then(() => {
      if (onAfterNavigationItemRouted) {
        onAfterNavigationItemRouted();
      }
    });
  };

  // Handle when user press `Enter` in input box
  const handleSurahInputSubmit = (e) => {
    e.preventDefault();
    const firstFilteredChapter = filteredChapters[0];
    if (firstFilteredChapter) {
      const href = getSurahNavigationUrl(firstFilteredChapter.id);
      navigateAndHandleAfterNavigation(href);
    }
  };

  const handleChapterClick = (e: React.MouseEvent, href: string, chapterId: string) => {
    e.preventDefault();

    // If we have a custom handler and navigation is disabled, use the custom handler
    if (customChapterSelectHandler && shouldDisableNavigation) {
      customChapterSelectHandler(chapterId);
      return;
    }

    // Otherwise use the default navigation behavior
    navigateAndHandleAfterNavigation(href);
  };

  return (
    <div className={styles.surahListContainer}>
      <form onSubmit={handleSurahInputSubmit}>
        <input
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('sidebar.search-surah')}
        />
      </form>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {filteredChapters.map((chapter) => {
            const href = getSurahNavigationUrl(chapter.id);
            return (
              <Link
                key={chapter.id}
                href={href}
                shouldPrefetch={false}
                onClick={(e) => handleChapterClick(e, href, chapter.id.toString())}
              >
                <div
                  ref={chapter.id.toString() === currentChapterId ? selectedChapterRef : null}
                  className={classNames(styles.listItem, {
                    [styles.selectedItem]: chapter.id.toString() === currentChapterId,
                  })}
                >
                  <span className={styles.chapterNumber}>{chapter.localizedId}</span>
                  <span>{chapter.transliteratedName}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurahList;
