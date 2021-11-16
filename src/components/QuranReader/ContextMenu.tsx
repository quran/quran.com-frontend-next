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
import { shouldUseMinimalLayout } from 'src/utils/locale';
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
    return hizb ? getJuzNumberByHizb(Number(hizb)) : null;
  }, [hizb]);
  // if it's SSR or the first time we render this
  if (!verseKey) {
    return <></>;
  }
  const verse = getVerseNumberFromKey(verseKey);
  const progress = getChapterReadingProgress(verse, chapterData.versesCount);
  const isMinimalLayout = shouldUseMinimalLayout(lang);

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
          <p className={classNames(styles.chapter, styles.bold)}>{chapterId}</p>
          <div className={classNames(styles.row)}>
            {!isMinimalLayout && (
              <p className={classNames(styles.alignStart, { [styles.hide]: !isExpanded })}>
                {chapterData.translatedName}
              </p>
            )}
            <p className={classNames(styles.bold, styles.alignStart)}>
              {chapterData.transliteratedName}
            </p>
          </div>
        </div>
        <div className={classNames(styles.section, styles.leftSection)}>
          <div className={classNames(styles.row)}>
            <p className={classNames(styles.alignEnd, { [styles.hide]: !isExpanded })}>
              {t('juz')} {juzNumber} / {t('hizb')} {hizb}
            </p>
            <p className={classNames(styles.alignEnd)}>
              {t('page')} {page}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
