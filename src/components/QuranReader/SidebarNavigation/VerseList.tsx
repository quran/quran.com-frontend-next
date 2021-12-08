import { useState, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { toLocalizedNumber } from 'src/utils/locale';
import { getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const chapterIds = useChapterIdsByUrlPath();
  const { t, lang } = useTranslation('common');

  const currentChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;

  const verseKeys = useMemo(
    () => (currentChapterId ? generateChapterVersesKeys(currentChapterId) : []),
    [currentChapterId],
  );

  return (
    <div className={styles.verseListContainer}>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={styles.searchInput}
        placeholder={t('verse')}
      />
      <div className={styles.list}>
        {verseKeys.map((verseKey) => {
          const verse = getVerseNumberFromKey(verseKey);
          if (!verse.toString().startsWith(searchQuery)) return null;
          return (
            <Link href={getVerseToEndOfChapterNavigationUrl(verseKey)}>
              <div className={styles.listItem}>{toLocalizedNumber(verse, lang)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VerseList;
