/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './ContextMenu.module.scss';
import ReadingPreferenceSwitcher, {
  ReadingPreferenceSwitcherType,
} from './ReadingPreferenceSwitcher';
import TajweedColors from './TajweedBar/TajweedBar';

import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import { SwitchSize } from '@/dls/Switch/Switch';
import useGetMushaf from '@/hooks/useGetMushaf';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectContextMenu } from '@/redux/slices/QuranReader/contextMenu';
import { selectNotes } from '@/redux/slices/QuranReader/notes';
import { selectLastReadVerseKey } from '@/redux/slices/QuranReader/readingTracker';
import {
  selectIsSidebarNavigationVisible,
  setIsVisible,
} from '@/redux/slices/QuranReader/sidebarNavigation';
import { Mushaf } from '@/types/QuranReader';
import { getChapterData, getChapterReadingProgress } from '@/utils/chapter';
import { logEvent } from '@/utils/eventLogger';
import { getJuzNumberByHizb } from '@/utils/juz';
import { toLocalizedNumber } from '@/utils/locale';
import { isMobile } from '@/utils/responsive';
import { getVerseNumberFromKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';

const ContextMenu = () => {
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const isSidebarNavigationVisible = useSelector(selectIsSidebarNavigationVisible);
  const { t, lang } = useTranslation('common');
  const mushaf = useGetMushaf();
  const isSideBarVisible = useSelector(selectNotes, shallowEqual).isVisible;
  const { isExpanded, showReadingPreferenceSwitcher: isReadingPreferenceSwitcherVisible } =
    useSelector(selectContextMenu, shallowEqual);

  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const showNavbar = isNavbarVisible || isActive;
  const showReadingPreferenceSwitcher = isReadingPreferenceSwitcherVisible && !isActive;

  const { verseKey, chapterId, page, hizb } = useSelector(selectLastReadVerseKey, shallowEqual);
  const chapterData = useMemo(() => {
    return chapterId ? getChapterData(chaptersData, chapterId) : null;
  }, [chapterId, chaptersData]);
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
        [styles.visibleContainer]: showNavbar,
        [styles.expandedContainer]: isExpanded,
        [styles.withVisibleSideBar]: isSideBarVisible,
      })}
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/naming-convention
      style={{ '--progress': `${progress}%` }} // this is to pass the value to css so it can be used to show the progress bar.
    >
      <div className={styles.sectionsContainer}>
        <div className={showReadingPreferenceSwitcher ? styles.section : styles.halfSection}>
          <div className={classNames(styles.row)}>
            <p
              className={classNames(styles.bold, styles.alignStart, styles.surahName, {
                [styles.disabledOnMobile]: isSidebarNavigationVisible,
                // on mobile, the click event is conflicting with `onClickOutside`,
                // causing the sidebar to be closed and opened again when this clicked. So we disable one of them for now
              })}
              onClick={(e) => {
                logEvent(
                  `sidebar_navigation_${isSidebarNavigationVisible ? 'close' : 'open'}_trigger`,
                );
                e.stopPropagation();
                if (isSidebarNavigationVisible === 'auto') {
                  // eslint-disable-next-line no-unneeded-ternary
                  const shouldBeVisible = isMobile() ? true : false;
                  dispatch(setIsVisible(shouldBeVisible));
                } else {
                  dispatch(setIsVisible(!isSidebarNavigationVisible));
                }
              }}
            >
              {chapterData.transliteratedName}
              <span
                className={classNames(styles.chevronIconContainer, {
                  [styles.rotate180]: isSidebarNavigationVisible === true,
                  [styles.rotateAuto]: isSidebarNavigationVisible === 'auto',
                })}
              >
                <ChevronDownIcon />
              </span>
            </p>
          </div>
        </div>
        {showReadingPreferenceSwitcher && (
          <div className={styles.halfSection}>
            <ReadingPreferenceSwitcher
              size={SwitchSize.XSmall}
              isIconsOnly
              type={ReadingPreferenceSwitcherType.ContextMenu}
            />
          </div>
        )}
        <div className={showReadingPreferenceSwitcher ? styles.section : styles.halfSection}>
          <div className={classNames(styles.row)}>
            <p
              className={classNames(styles.alignEnd, {
                [styles.hide]: !isExpanded,
              })}
            />
            <p className={classNames(styles.alignEnd)}>
              {isExpanded && (
                <span className={styles.secondaryInfo}>
                  {/* eslint-disable-next-line i18next/no-literal-string */}
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
      {mushaf === Mushaf.QCFTajweedV4 && <TajweedColors />}
    </div>
  );
};

export default ContextMenu;
