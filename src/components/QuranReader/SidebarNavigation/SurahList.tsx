import { useState } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { getAllChaptersData } from 'src/utils/chapter';
import Chapter from 'types/Chapter';

const filterSurah = (surah, searchQuery: string) => {
  const fuse = new Fuse(surah, {
    threshold: 0.3,
    keys: ['id', 'transliteratedName'],
  });

  const filteredSurah = fuse.search(searchQuery).map(({ item }) => item);
  return filteredSurah as Chapter[];
};

const SurahList = () => {
  const chapterIds = useChapterIdsByUrlPath();
  const currentChapterId = chapterIds[0];
  const { t } = useTranslation('common');

  const chaptersData = getAllChaptersData();
  const [searchQuery, setSearchQuery] = useState('');

  const chapterDataArray = Object.entries(chaptersData).map(([id, chapter]) => ({
    ...chapter,
    id,
  }));
  const filteredChapters = searchQuery
    ? filterSurah(chapterDataArray, searchQuery)
    : chapterDataArray;
  return (
    <div className={styles.surahListContainer}>
      <input
        className={styles.searchInput}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('sidebar.search-surah')}
      />
      <div className={styles.list}>
        {filteredChapters.map((chapter) => (
          <Link href={`/${chapter.id}`}>
            <div
              className={classNames(styles.listItem, {
                [styles.selectedItem]: chapter.id.toString() === currentChapterId,
              })}
            >
              {chapter.transliteratedName}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SurahList;
