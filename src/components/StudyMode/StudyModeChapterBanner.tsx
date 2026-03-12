import { useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import { EbookBannerContext } from '../Ebook/EbookBanner';

import styles from './StudyModeChapterBanner.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useAuthData from '@/hooks/auth/useAuthData';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import CloseIcon from '@/icons/close.svg';
import {
  selectIsLessonsEbookBannerVisible,
  selectIsReflectionsEbookBannerVisible,
} from '@/redux/slices/ebookBanner';
import {
  selectIsLessonsChapterBannerVisible,
  selectIsReflectionsChapterBannerVisible,
  setIsLessonsChapterBannerVisible,
  setIsReflectionsChapterBannerVisible,
} from '@/redux/slices/QuranReader/studyMode';
import EventName, { getEventName } from '@/utils/event-names';
import { logButtonClick } from '@/utils/eventLogger';
import { EXTERNAL_ROUTES } from '@/utils/navigation';

interface StudyModeChapterBannerProps {
  floating?: boolean;
  containerClassName?: string;
  isDismissible?: boolean;
  disableMobile?: boolean;
  disableDesktop?: boolean;
  chapterId?: string;
  context?: EbookBannerContext;
}

const HIDE_DATE = new Date('2026-03-20');

const StudyModeChapterBanner = ({
  floating = false,
  containerClassName,
  isDismissible = true,
  chapterId,
  context,
  disableMobile = false,
  disableDesktop = false,
}: StudyModeChapterBannerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const isLessonsChapterBannerVisible = useSelector(selectIsLessonsChapterBannerVisible);
  const isReflectionsChapterBannerVisible = useSelector(selectIsReflectionsChapterBannerVisible);
  const isDismissed = useMemo(() => {
    if (!context) return false;
    return context === EbookBannerContext.LESSONS
      ? !isLessonsChapterBannerVisible
      : !isReflectionsChapterBannerVisible;
  }, [context, isLessonsChapterBannerVisible, isReflectionsChapterBannerVisible]);

  const isLessonsEbookBannerVisible = useSelector(selectIsLessonsEbookBannerVisible);
  const isReflectionsEbookBannerVisible = useSelector(selectIsReflectionsEbookBannerVisible);
  const isEbookBannerVisible = useMemo(() => {
    if (!context) return false;
    return context === EbookBannerContext.LESSONS
      ? isLessonsEbookBannerVisible
      : isReflectionsEbookBannerVisible;
  }, [context, isLessonsEbookBannerVisible, isReflectionsEbookBannerVisible]);

  const isLoggedIn = useIsLoggedIn();
  const { userData } = useAuthData();
  const hasConsentedToEbook = isLoggedIn && userData?.consents?.ebook === true;

  const isEbookBannerActive = isEbookBannerVisible && !hasConsentedToEbook;

  const isPastHideDate = Date.now() >= HIDE_DATE.getTime();

  if (
    isPastHideDate ||
    chapterId !== '67' ||
    (isDismissible && isDismissed) ||
    isEbookBannerActive
  ) {
    return null;
  }

  const onCloseClicked = () => {
    logButtonClick(
      getEventName({
        eventName: EventName.QURAN_READER_STUDY_MODE_CHAPTER_BANNER,
        suffix: 'dismissed',
      }),
    );

    if (context === EbookBannerContext.LESSONS) {
      dispatch(setIsLessonsChapterBannerVisible(false));
    } else {
      dispatch(setIsReflectionsChapterBannerVisible(false));
    }
  };

  const onCtaClicked = () => {
    logButtonClick(
      getEventName({
        eventName: EventName.QURAN_READER_STUDY_MODE_CHAPTER_BANNER,
        suffix: 'cta',
      }),
    );
  };

  return (
    <div
      className={classNames(styles.studyModeChapterBanner, containerClassName, {
        [styles.studyModeChapterBannerFloating]: floating,
        [styles.studyModeChapterBannerBlock]: !floating,
        [styles.disableMobile]: disableMobile,
        [styles.disableDesktop]: disableDesktop,
      })}
    >
      <div className={styles.studyModeChapterBannerContent}>
        <p className={styles.studyModeChapterBannerTitle}>{t('study-mode-chapter-banner.title')}</p>
        <ul className={styles.studyModeChapterBannerDescription}>
          <li>{t('study-mode-chapter-banner.descriptions.line1')}</li>
          <li>{t('study-mode-chapter-banner.descriptions.line2')}</li>
        </ul>
        <p className={styles.studyModeChapterBannerFooter}>
          {t('study-mode-chapter-banner.footer')}
        </p>
      </div>

      <Button
        className={styles.studyModeChapterBannerCta}
        shape={ButtonShape.Rounded}
        href={EXTERNAL_ROUTES.QURAN_REFLECT}
        isNewTab
        onClick={onCtaClicked}
      >
        {t('study-mode-chapter-banner.cta')}
      </Button>

      {isDismissible && (
        <Button
          onClick={onCloseClicked}
          aria-label={t('close')}
          className={styles.closeButton}
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};

export default StudyModeChapterBanner;
