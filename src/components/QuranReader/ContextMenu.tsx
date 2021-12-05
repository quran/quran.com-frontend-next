import React, { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './ContextMenu.module.scss';

import { selectNavbar } from 'src/redux/slices/navbar';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectLastReadVerseKey } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData, getChapterReadingProgress } from 'src/utils/chapter';
import { getJuzNumberByHizb } from 'src/utils/juz';
import { toLocalizedNumber } from 'src/utils/locale';
import { getVerseNumberFromKey } from 'src/utils/verse';

const ContextMenu = () => {
  const { t, lang } = useTranslation('common');
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);
  const isNavbarVisible = useSelector(selectNavbar, shallowEqual).isVisible;
  const { verseKey, chapterId, page, hizb } = useSelector(selectLastReadVerseKey, shallowEqual);
  const chapterData = useMemo(() => {
    return chapterId ? getChapterData(chapterId, lang) : null;
  }, [chapterId, lang]);
  const juzNumber = useMemo(() => {
    return hizb ? toLocalizedNumber(getJuzNumberByHizb(Number(hizb)), lang) : null;
  }, [hizb, lang]);
  const localizedHizb = useMemo(() => {
    return toLocalizedNumber(Number(hizb), lang);
  }, [hizb, lang]);
  const localizedPageNumber = useMemo(() => {
    return toLocalizedNumber(Number(page), lang);
  }, [page, lang]);

  // if it's SSR or the first time we render this
  if (!verseKey) {
    return <></>;
  }
  const verse = getVerseNumberFromKey(verseKey);
  const progress = getChapterReadingProgress(verse, chapterData.versesCount);

  return (
    <div
      className={classNames(styles.container, {
        [styles.visibleContainer]: isNavbarVisible,
        [styles.expandedContainer]: isExpanded,
        [styles.withVisibleSideBar]: isSideBarVisible,
      })}
      // @ts-ignore
      style={{ '--progress': `${progress}%` }} // this is to pass the value to css so it can be used to show the progress bar.
    >
      <div className={styles.sectionsContainer}>
        <div className={styles.section}>
          <div className={classNames(styles.row)}>
            <p className={classNames(styles.bold, styles.alignStart)}>
              {chapterData.transliteratedName}
            </p>
          </div>
        </div>
        <div className={classNames(styles.section, styles.leftSection)}>
          <div className={classNames(styles.row)}>
            <p className={classNames(styles.alignEnd, { [styles.hide]: !isExpanded })} />
            <p className={classNames(styles.alignEnd)}>
              {isExpanded && (
                <span className={styles.secondaryInfo}>
                  {t('juz')} {juzNumber} / {t('hizb')} {localizedHizb} -{' '}
                </span>
              )}
              <span className={styles.primaryInfo}>
                {t('page')} {localizedPageNumber}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
