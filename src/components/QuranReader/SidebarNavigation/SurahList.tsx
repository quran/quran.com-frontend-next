import { useContext, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import DataContext from 'src/contexts/DataContext';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from 'src/hooks/useScrollToElement';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { getSurahNavigationUrl } from 'src/utils/navigation';
import Chapter from 'types/Chapter';

const filterSurah = (surah, searchQuery: string) => {
  const fuse = new Fuse(surah, {
    threshold: 0.3,
    keys: ['id', 'localizedId', 'transliteratedName'],
  });

  const filteredSurah = fuse.search(searchQuery).map(({ item }) => item);
  if (!filteredSurah.length) {
    logEmptySearchResults(searchQuery, 'sidebar_navigation_chapter_list');
  }
  return filteredSurah as Chapter[];
};

const SurahList = () => {
  const { t, lang } = useTranslation('common');
  const chapterIds = useChapterIdsByUrlPath(lang);
  const currentChapterId = chapterIds[0];
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const [searchQuery, setSearchQuery] = useState('');

  const chapterDataArray = useMemo(
    () =>
      Object.entries(chaptersData).map(([id, chapter]) => {
        return {
          ...chapter,
          id,
          localizedId: toLocalizedNumber(Number(id), lang),
        };
      }),
    [chaptersData, lang],
  );

  const filteredChapters = searchQuery
    ? filterSurah(chapterDataArray, searchQuery)
    : chapterDataArray;

  const [scrollTo, selectedChapterRef] =
    useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);

  useEffect(() => {
    scrollTo();
  }, [currentChapterId, scrollTo]);

  // Handle when user press `Enter` in input box
  const handleSurahInputSubmit = (e) => {
    e.preventDefault();
    const firstFilteredChapter = filteredChapters[0];
    if (firstFilteredChapter) {
      router.push(getSurahNavigationUrl(firstFilteredChapter.id));
    }
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
          {filteredChapters.map((chapter) => (
            <Link key={chapter.id} href={getSurahNavigationUrl(chapter.id)} shouldPrefetch={false}>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurahList;
