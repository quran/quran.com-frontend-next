import { useState, useMemo, useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const chapterIds = useChapterIdsByUrlPath(lang);
  const currentChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;
  const router = useRouter();

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

  // Handle when user press `Enter` in input box
  const handleVerseInputSubmit = (e) => {
    e.preventDefault();
    const selectedVerseKey = filteredVerseKeys.find((verseKey) => verseKey.endsWith(searchQuery));
    if (selectedVerseKey)
      router.push(getChapterWithStartingVerseUrl(selectedVerseKey), undefined, {
        shallow: true, // https://nextjs.org/docs/routing/shallow-routing
      });
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
      <div className={styles.list}>
        {filteredVerseKeys.map((verseKey) => {
          const verseNumber = getVerseNumberFromKey(verseKey);
          const localizedVerseNumber = toLocalizedNumber(verseNumber, lang);
          return (
            <Link
              href={getChapterWithStartingVerseUrl(verseKey)}
              key={verseKey}
              isShallow
              prefetch={false}
            >
              <div className={styles.listItem}>{localizedVerseNumber}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VerseList;
