import React, { useMemo } from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './ContextMenu.module.scss';

import { selectNavbar } from 'src/redux/slices/navbar';
import { selectContextMenu } from 'src/redux/slices/QuranReader/contextMenu';
import { selectNotes } from 'src/redux/slices/QuranReader/notes';
import { selectLastReadVerseKey } from 'src/redux/slices/QuranReader/readingTracker';
import { getChapterData, getChapterReadingProgress } from 'src/utils/chapter';
import { getJuzNumberByHizb } from 'src/utils/juz';
import { getVerseNumberFromKey } from 'src/utils/verse';

const ContextMenu = () => {
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const { isExpanded } = useSelector(selectContextMenu, shallowEqual);
  const isNavbarVisible = useSelector(selectNavbar, shallowEqual).isVisible;
  const { verseKey, chapterId, page, hizb } = useSelector(selectLastReadVerseKey, shallowEqual);
  const chapterData = useMemo(() => {
    return chapterId ? getChapterData(chapterId) : null;
  }, [chapterId]);
  const juzNumber = useMemo(() => {
    return hizb ? getJuzNumberByHizb(Number(hizb)) : null;
  }, [hizb]);
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
        <div className={styles.leftSection}>
          <p className={classNames(styles.chapter, styles.bold)}>{chapterId}</p>
          <div className={styles.rowsContainer}>
            <div className={classNames({ [styles.hide]: !isExpanded }, styles.row)}>
              <p className={styles.col}>{chapterData.translatedName.name}</p>
              <p className={styles.col}>
                Juz {juzNumber} / Hizb {hizb}
              </p>
            </div>
            <div className={styles.row}>
              <p className={classNames(styles.col, styles.bold)}>{chapterData.nameSimple}</p>
              <p className={styles.col}>Page {page}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
