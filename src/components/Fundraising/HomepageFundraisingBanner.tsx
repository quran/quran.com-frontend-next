import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './HomepageFundraisingBanner.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import { ModalSize } from '@/components/dls/Modal/Content';
import Modal from '@/components/dls/Modal/Modal';
import ShareButtons from '@/components/dls/ShareButtons';
import Link, { LinkVariant } from '@/dls/Link/Link';
import CloseIcon from '@/icons/close.svg';
import DiamondIcon from '@/icons/diamond.svg';
import {
  selectIsHomepageBannerVisible,
  selectIsQuranReaderBannerVisible,
  setIsHomepageBannerVisible,
  setIsQuranReaderBannerVisible,
} from '@/redux/slices/fundraisingBanner';
import { makeDonatePageUrl, makeDonateUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';

export enum FundraisingBannerContext {
  Homepage = 'homepage',
  QuranReader = 'quranReader',
}

interface HomepageFundraisingBannerProps {
  /**
   * Whether the banner can be dismissed by the user
   * When false, the banner will always be shown and cannot be closed
   * When true, the banner visibility is controlled by Redux state
   * @default true
   */
  isDismissible?: boolean;
  /** Which Redux state to use for visibility/dismiss. Defaults to Homepage. */
  context?: FundraisingBannerContext;
  /** Prefix used for analytics event names. Defaults to context-based value. */
  analyticsSource?: string;
  /** Extra params attached to every analytics event fired by this banner. */
  analyticsParams?: Record<string, any>;
}

const HomepageFundraisingBanner = ({
  isDismissible = true,
  context = FundraisingBannerContext.Homepage,
  analyticsSource,
  analyticsParams,
}: HomepageFundraisingBannerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isHomepageVisible = useSelector(selectIsHomepageBannerVisible);
  const isQuranReaderVisible = useSelector(selectIsQuranReaderBannerVisible);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isVisible =
    context === FundraisingBannerContext.QuranReader ? isQuranReaderVisible : isHomepageVisible;

  // If dismissible and not visible in Redux state, don't render
  if (isDismissible && !isVisible) {
    return null;
  }

  const resolvedAnalyticsSource =
    analyticsSource ??
    (context === FundraisingBannerContext.QuranReader
      ? 'quran_reader'
      : 'homepage_donation_section');

  const onDonateClicked = () => {
    const href = makeDonatePageUrl(false, true); // Monthly donation with provider URL
    logButtonClick(`${resolvedAnalyticsSource}_donate`, analyticsParams);
    navigateToExternalUrl(href);
  };

  const onShareClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_share`, analyticsParams);
    setIsShareModalOpen(true);
  };

  const onCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  const onLearnMoreClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_learn_more`, analyticsParams);
  };

  const onCloseClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_dismissed`, analyticsParams);
    if (context === FundraisingBannerContext.QuranReader) {
      dispatch(setIsQuranReaderBannerVisible(false));
    } else {
      dispatch(setIsHomepageBannerVisible(false));
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t('fundraising.title')}</h2>
          <div className={styles.description}>
            <span>{`${t('fundraising.description')} `}</span>
            <Link
              href={makeDonateUrl()}
              onClick={onLearnMoreClicked}
              variant={LinkVariant.Highlight}
              isNewTab
              className={styles.learnMoreLink}
            >
              {t('learn-more')}
            </Link>
          </div>
          <div className={styles.actions}>
            <Button
              onClick={onShareClicked}
              type={ButtonType.Primary}
              size={ButtonSize.Small}
              variant={ButtonVariant.Simplified}
              className={styles.shareButton}
            >
              {t('share')}
            </Button>
            <div className={styles.rightActions}>
              <Button
                onClick={onDonateClicked}
                type={ButtonType.Primary}
                size={ButtonSize.Small}
                variant={ButtonVariant.Simplified}
                className={styles.donateButton}
              >
                <DiamondIcon />
                {t('donate-now')}
              </Button>
            </div>
          </div>
        </div>
        {isDismissible && (
          <button
            onClick={onCloseClicked}
            aria-label={t('close')}
            className={styles.closeButton}
            type="button"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <Modal isOpen={isShareModalOpen} onClickOutside={onCloseShareModal} size={ModalSize.MEDIUM}>
        <Modal.Body>
          <button
            onClick={onCloseShareModal}
            type="button"
            aria-label={t('close')}
            className={styles.modalCloseButton}
          >
            <CloseIcon />
          </button>
          <Modal.Title>{t('fundraising-share-title')}</Modal.Title>
          <ShareButtons
            url={makeDonateUrl()}
            title={t('fundraising.title')}
            analyticsContext="fundraising_banner"
            hideVideoGeneration
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HomepageFundraisingBanner;
