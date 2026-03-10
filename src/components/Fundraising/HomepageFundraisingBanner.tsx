import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from './HomepageFundraisingBanner.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';
import DiamondIcon from '@/icons/diamond.svg';
import {
  selectIsHomepageBannerVisible,
  setIsHomepageBannerVisible,
} from '@/redux/slices/fundraisingBanner';
import { makeDonateUrl, makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

export enum FundraisingBannerContext {
  Homepage = 'homepage',
  QuranReader = 'quranReader',
}

export enum FundraisingBannerLayout {
  Inline = 'inline',
  Floating = 'floating',
}

interface HomepageFundraisingBannerProps {
  /**
   * Whether the banner can be dismissed by the user.
   * @default true
   */
  isDismissible?: boolean;
  /** Which Redux state to use for visibility/dismiss. Defaults to Homepage. */
  context?: FundraisingBannerContext;
  /** Prefix used for analytics event names. Defaults to context-based value. */
  analyticsSource?: string;
  /** Extra params attached to every analytics event fired by this banner. */
  analyticsParams?: Record<string, any>;
  /** Render mode for homepage in-flow card vs reader floating card. */
  layout?: FundraisingBannerLayout;
}

const HomepageFundraisingBanner = ({
  isDismissible = true,
  context = FundraisingBannerContext.Homepage,
  analyticsSource,
  analyticsParams,
  layout = FundraisingBannerLayout.Inline,
}: HomepageFundraisingBannerProps) => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const isHomepageVisible = useSelector(selectIsHomepageBannerVisible);
  const isHomepageBanner = context === FundraisingBannerContext.Homepage;

  if (isHomepageBanner && isDismissible && !isHomepageVisible) {
    return null;
  }

  const resolvedAnalyticsSource =
    analyticsSource ??
    (context === FundraisingBannerContext.QuranReader
      ? 'quran_reader_end_of_scroll_banner'
      : 'homepage_donation_section');

  const onCloseClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_dismissed`, {
      layout,
      ...analyticsParams,
    });
    if (isHomepageBanner) {
      dispatch(setIsHomepageBannerVisible(false));
    }
  };

  const onLearnMoreClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_learn_more`, {
      layout,
      ...analyticsParams,
    });
  };

  return (
    <div
      className={classNames(styles.container, {
        [styles.inline]: layout === FundraisingBannerLayout.Inline,
        [styles.floating]: layout === FundraisingBannerLayout.Floating,
      })}
    >
      <div className={styles.content}>
        <h2 className={styles.title}>{t('fundraising-card-v2.title')}</h2>
        <p className={styles.description}>
          {t('fundraising.description')}{' '}
          <a
            href={makeDonateUrl()}
            className={styles.learnMoreLink}
            onClick={onLearnMoreClicked}
            rel="noreferrer"
            target="_blank"
          >
            {t('learn-more')}
          </a>
        </p>
        <div className={styles.actions}>
          <Button
            href={makeDonatePageUrl(false, true)}
            onClick={() =>
              logButtonClick(`${resolvedAnalyticsSource}_donate`, {
                layout,
                ...analyticsParams,
              })
            }
            type={ButtonType.Primary}
            size={ButtonSize.Small}
            variant={ButtonVariant.Simplified}
            isNewTab
            className={styles.donateButton}
          >
            <DiamondIcon />
            <span className={styles.fundraisingCard}>{t('fundraising-card-v2.cta')}</span>
          </Button>
        </div>
      </div>

      {isHomepageBanner && isDismissible && (
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
  );
};

export default HomepageFundraisingBanner;
