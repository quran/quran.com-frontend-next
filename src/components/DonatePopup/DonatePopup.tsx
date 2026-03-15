/* eslint-disable max-lines */
import { useMemo } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from './DonatePopup.module.scss';
import { getCurrentRamadanDonationPopupAyah } from './ramadanDonationPopupAyah';
import useDonationPopupImpression from './useDonationPopupImpression';
import useDonationPopupNow from './useDonationPopupNow';
import { DONATION_POPUP_HIDE_DURATION_MS, shouldShowDonationPopup } from './utils';

import Skeleton from '@/components/dls/Skeleton/Skeleton';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Modal from '@/dls/ContentModal/ContentModal';
import CloseIcon from '@/icons/close.svg';
import { getTranslationsInitialState } from '@/redux/defaultSettings/util';
import {
  selectDonationPopupState,
  setDonationPopupHiddenUntilMs,
  setDonationPopupPermanentlyDismissed,
} from '@/redux/slices/fundraisingBanner';
import DonationOverview from '@/types/DonationOverview';
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { makeDonatePageUrl, makeDonateUrl } from '@/utils/apiPaths';
import {
  getDonationOverview,
  RAMADAN_2026_DONATION_CAMPAIGN,
  RAMADAN_2026_EXTENDED_GOAL,
  RAMADAN_2026_MONTHLY_GOAL,
  getDonationProgressState,
} from '@/utils/donation/api';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { isAuthPage, isQuranReaderRoutePathname } from '@/utils/routes';

const DONATE_POPUP_VERSE_FONT_SCALE = 3;
const renderVerseLoadingFallback = () => (
  <div className={styles.verseLoading}>
    <Skeleton className={styles.verseArabicSkeleton} />
    <Skeleton className={styles.verseTranslationSkeleton} />
  </div>
);

const DonatePopup = () => {
  const { t, lang: locale } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const donationPopupState = useSelector(selectDonationPopupState);
  const nowMs = useDonationPopupNow(donationPopupState);
  const currentAyah = useMemo(() => getCurrentRamadanDonationPopupAyah(new Date(nowMs)), [nowMs]);
  const popupTranslationIds = useMemo(
    () => getTranslationsInitialState(locale).selectedTranslations,
    [locale],
  );
  const shouldShowPopupReference = locale !== Language.AR;
  const shouldHidePopupTranslation = !shouldShowPopupReference && popupTranslationIds.length === 0;

  const isEmbedPage = router.pathname.startsWith('/embed');
  const isReaderRoute = isQuranReaderRoutePathname(router.pathname);
  const shouldShow = shouldShowDonationPopup({
    nowMs,
    isAuthPage: isAuthPage(router),
    isEmbedPage,
    popupState: donationPopupState,
  });

  const analyticsParams = useMemo(
    () => ({
      pathname: router.asPath || router.pathname,
      locale,
      isReaderRoute,
    }),
    [isReaderRoute, locale, router.asPath, router.pathname],
  );

  const { data: donationOverview, error: donationOverviewError } =
    useSWRImmutable<DonationOverview | null>(
      shouldShow ? ['ramadan-donation-overview', RAMADAN_2026_DONATION_CAMPAIGN] : null,
      () => getDonationOverview(RAMADAN_2026_DONATION_CAMPAIGN),
    );

  useDonationPopupImpression({
    shouldShow,
    asPath: router.asPath,
    analyticsParams,
  });

  const handleTemporaryDismiss = () => {
    logButtonClick('ramadan_donation_popup_close', analyticsParams);
    dispatch(setDonationPopupHiddenUntilMs(Date.now() + DONATION_POPUP_HIDE_DURATION_MS));
  };

  const handleDismissPermanently = () => {
    logButtonClick('ramadan_donation_popup_dont_show_again', analyticsParams);
    dispatch(setDonationPopupPermanentlyDismissed(true));
  };

  const handleLearnMoreClick = () => {
    logButtonClick('ramadan_donation_popup_learn_more', analyticsParams);
  };

  const handleDonateClick = () => {
    logButtonClick('ramadan_donation_popup_donate', analyticsParams);
  };

  if (!shouldShow) return null;

  const isOverviewLoading = donationOverview === undefined && !donationOverviewError;
  const shouldShowProgress = !!donationOverview && !donationOverviewError;
  const totalAmount = donationOverview?.totalAmount ?? 0;
  const donationProgress = getDonationProgressState(
    totalAmount,
    RAMADAN_2026_MONTHLY_GOAL,
    RAMADAN_2026_EXTENDED_GOAL,
  );
  const hasExtendedProgress =
    donationProgress.isExtended && donationProgress.milestonePercentage !== null;
  const hasOverflowProgress =
    hasExtendedProgress && donationProgress.overflowProgressPercentage > 0;
  const progressOverflowFillWidth = hasOverflowProgress
    ? `${donationProgress.overflowProgressPercentage}%`
    : undefined;
  const progressOverflowGridTemplate = hasExtendedProgress
    ? `${donationProgress.milestonePercentage}% 1fr`
    : undefined;
  const formattedTotalAmount = toLocalizedNumber(Math.round(totalAmount), locale);
  const formattedGoalAmount = toLocalizedNumber(donationProgress.displayGoalAmount, locale);

  return (
    <Modal
      hasHeader={false}
      isOpen
      onEscapeKeyDown={(event) => event.preventDefault()}
      overlayClassName={styles.mobileBottomSheetOverlay}
      contentClassName={styles.modalContent}
      innerContentClassName={styles.modalInnerContent}
      isBottomSheetOnMobile
      shouldCloseOnOutsideClick={false}
    >
      <div className={styles.container} data-testid="ramadan-donation-popup">
        <Dialog.Title className={styles.srOnly}>{t('ramadan-donation-popup.title')}</Dialog.Title>
        <Dialog.Description className={styles.srOnly}>
          {`${t('ramadan-donation-popup.subtitle.start')} ${t(
            'ramadan-donation-popup.subtitle.end',
          )}`}
        </Dialog.Description>

        <button
          type="button"
          onClick={handleTemporaryDismiss}
          className={styles.closeButton}
          aria-label={t('close')}
        >
          <CloseIcon />
        </button>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('ramadan-donation-popup.title')}</h1>
            <p className={styles.subtitle}>
              <span className={styles.subtitlePrimaryLine}>
                {t('ramadan-donation-popup.subtitle.start')}
              </span>
              <span
                className={styles.subtitleSecondaryLine}
                data-testid="ramadan-donation-popup-subtitle-secondary-line"
              >
                {t('ramadan-donation-popup.subtitle.end')}{' '}
                <a
                  href={makeDonateUrl()}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLearnMoreClick}
                  className={styles.learnMoreLink}
                >
                  {t('ramadan-donation-popup.learn-more')}
                </a>
              </span>
            </p>
          </div>

          <div className={styles.verseSection}>
            <div className={styles.verseCard}>
              {currentAyah ? (
                <VerseAndTranslation
                  chapter={currentAyah.chapter}
                  from={currentAyah.verse}
                  to={currentAyah.verse}
                  quranFont={QuranFont.QPCHafs}
                  translationsLimit={1}
                  translationIds={popupTranslationIds}
                  arabicVerseClassName={styles.verseArabic}
                  translationClassName={classNames(styles.verseTranslation, {
                    [styles.verseTranslationHidden]: shouldHidePopupTranslation,
                  })}
                  translationTextClassName={styles.verseTranslationText}
                  fixedFontScale={DONATE_POPUP_VERSE_FONT_SCALE}
                  shouldShowReference={shouldShowPopupReference}
                  shouldLinkReference={false}
                  loadingFallback={renderVerseLoadingFallback()}
                />
              ) : (
                renderVerseLoadingFallback()
              )}
            </div>

            <p className={styles.nextAyahText}>{t('ramadan-donation-popup.next-ayah')}</p>
          </div>

          <div className={styles.footerContent}>
            {isOverviewLoading && (
              <div className={styles.progressSection} data-testid="ramadan-donation-popup-progress">
                <div className={styles.progressHeader}>
                  <Skeleton className={styles.amountSkeleton} />
                  <Skeleton className={styles.amountSkeleton} />
                </div>
                <Skeleton className={styles.progressSkeleton} />
                <Skeleton className={styles.goalSkeleton} />
              </div>
            )}

            {shouldShowProgress && (
              <div className={styles.progressSection} data-testid="ramadan-donation-popup-progress">
                <div className={styles.progressHeader}>
                  <p className={styles.amountText}>
                    <span className={styles.amountValue}>${formattedTotalAmount}</span>
                    <span>{t('ramadan-donation-popup.month-raised')}</span>
                  </p>
                  <p className={styles.goalAmountText}>
                    <span>${formattedGoalAmount}</span>
                    <span>{t('ramadan-donation-popup.month-goal')}</span>
                  </p>
                </div>
                <div className={styles.progressTrackWrapper} aria-hidden="true">
                  <div className={styles.progressTrack}>
                    <div
                      className={classNames(styles.progressFill, {
                        [styles.progressFillFlatEnd]: hasOverflowProgress,
                      })}
                      style={{ width: `${donationProgress.filledToMilestonePercentage}%` }}
                      data-testid="ramadan-donation-popup-progress-fill"
                    />
                    {hasOverflowProgress && (
                      <div
                        className={styles.progressOverflowFill}
                        style={{
                          insetInlineStart: `${donationProgress.milestonePercentage}%`,
                          width: progressOverflowFillWidth,
                        }}
                        data-testid="ramadan-donation-popup-progress-overflow-fill"
                      />
                    )}
                  </div>
                  {hasExtendedProgress && (
                    <div
                      className={styles.progressGoalMarker}
                      style={{
                        insetInlineStart: `${donationProgress.milestonePercentage}%`,
                      }}
                      data-testid="ramadan-donation-popup-progress-goal-marker"
                    />
                  )}
                </div>
                {hasExtendedProgress ? (
                  <div
                    className={styles.progressOverflowLabels}
                    style={{
                      gridTemplateColumns: progressOverflowGridTemplate,
                    }}
                  >
                    <p className={styles.progressReachedLabel}>
                      {t('ramadan-donation-popup.goal-label')}
                    </p>
                    <p className={styles.progressExtendedGoalLabel}>
                      {t('ramadan-donation-popup.extended-goal-label')}
                    </p>
                  </div>
                ) : (
                  <p className={styles.progressLabel}>{t('ramadan-donation-popup.goal-label')}</p>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <a
                href={makeDonatePageUrl(false, true)}
                onClick={handleDonateClick}
                className={styles.donateButton}
                rel="noreferrer"
                target="_blank"
              >
                {t('ramadan-donation-popup.donate-now')}
              </a>
              <button
                type="button"
                onClick={handleDismissPermanently}
                className={styles.dismissForeverButton}
              >
                {t('ramadan-donation-popup.dont-show-again')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DonatePopup;
