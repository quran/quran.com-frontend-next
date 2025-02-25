import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './HomepageFundraisingBanner.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import CloseIcon from '@/icons/close.svg';
import DiamondIcon from '@/icons/diamond.svg';
import {
  selectIsHomepageBannerVisible,
  setIsHomepageBannerVisible,
} from '@/redux/slices/fundraisingBanner';
import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import DonateButtonType from '@/types/DonateButtonType';
import LearnMoreClickSource from '@/types/LearnMoreClickSource';
import { makeDonatePageUrl, makeDonateUrl } from '@/utils/apiPaths';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';

const HomepageFundraisingBanner = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isVisible = useSelector(selectIsHomepageBannerVisible);

  if (!isVisible) {
    return null;
  }

  const onDonateClicked = () => {
    const href = makeDonatePageUrl(false, true); // Monthly donation with provider URL
    logEvent('donate_button_clicked', {
      source: `${DonateButtonClickSource.BANNER}_${DonateButtonType.MONTHLY}`,
    });
    navigateToExternalUrl(href);
  };

  const onShareClicked = () => {
    logButtonClick('share_button_clicked');
  };

  const onLearnMoreClicked = () => {
    logEvent('learn_more_button_clicked', {
      source: LearnMoreClickSource.SIDEBAR_BANNER,
    });
  };

  const onCloseClicked = () => {
    logEvent('fundraising_banner_closed', {
      source: 'homepage_banner',
    });
    dispatch(setIsHomepageBannerVisible(false));
  };

  return (
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
      <button
        onClick={onCloseClicked}
        aria-label={t('close')}
        className={styles.closeButton}
        type="button"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default HomepageFundraisingBanner;
