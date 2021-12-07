import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { getVerseToEndOfChapterNavigationUrl } from 'src/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const chapterIds = useChapterIdsByUrlPath();
  const { t } = useTranslation('common');
  if (!chapterIds || chapterIds.length === 0) return null;

  const currentChapterId = chapterIds[0];

  const verseKeys = generateChapterVersesKeys(currentChapterId);

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
              <div className={styles.listItem}>{verse}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VerseList;
