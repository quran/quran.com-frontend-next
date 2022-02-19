import { useState, useMemo, useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import styles from './SidebarNavigation.module.scss';

import Link from 'src/components/dls/Link/Link';
import useChapterIdsByUrlPath from 'src/hooks/useChapterId';
import { SCROLL_TO_NEAREST_ELEMENT, useScrollToElement } from 'src/hooks/useScrollToElement';
import { selectLastReadVerseKey } from 'src/redux/slices/QuranReader/readingTracker';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import { toLocalizedNumber } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';
import { generateChapterVersesKeys, getVerseNumberFromKey } from 'src/utils/verse';

const VerseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t, lang } = useTranslation('common');
  const chapterIds = useChapterIdsByUrlPath(lang);
  const currentChapterId = chapterIds && chapterIds.length > 0 ? chapterIds[0] : null;
  const lastReadVerseKey = useSelector(selectLastReadVerseKey, shallowEqual);

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

  const [scrollTo, selectedVerseRef] =
    useScrollToElement<HTMLDivElement>(SCROLL_TO_NEAREST_ELEMENT);

  useEffect(() => {
    scrollTo();
  }, [scrollTo, lastReadVerseKey.verseKey]);

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
            const verseNumber = getVerseNumberFromKey(verseKey);
            const localizedVerseNumber = toLocalizedNumber(verseNumber, lang);
            return (
              <Link
                href={getChapterWithStartingVerseUrl(verseKey)}
                key={verseKey}
                isShallow
                prefetch={false}
              >
                <div
                  ref={verseKey === lastReadVerseKey.verseKey ? selectedVerseRef : null}
                  className={classNames(styles.listItem, {
                    [styles.selectedItem]: verseKey === lastReadVerseKey.verseKey,
                  })}
                >
                  {localizedVerseNumber}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerseList;
