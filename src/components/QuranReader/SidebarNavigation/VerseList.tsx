import { useState, useMemo, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';
import VerseListItem from './VerseListItem';

import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const chapterIds = useChapterIdsByUrlPath(lang);
  const currentChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;

  const verseKeys = useMemo(
    () => (currentChapterId ? generateChapterVersesKeys(currentChapterId) : []),
    [currentChapterId],
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

  return (
    <div className={styles.verseListContainer}>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
        placeholder={t('verse')}
      />
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
