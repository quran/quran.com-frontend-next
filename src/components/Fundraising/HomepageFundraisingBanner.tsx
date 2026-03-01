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
  selectIsQuranReaderBannerVisible,
  selectIsQuranReaderFloatingBannerVisible,
  setIsHomepageBannerVisible,
  setIsQuranReaderBannerVisible,
  setIsQuranReaderFloatingBannerVisible,
} from '@/redux/slices/fundraisingBanner';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';

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
  const isQuranReaderVisible = useSelector(selectIsQuranReaderBannerVisible);
  const isQuranReaderFloatingVisible = useSelector(selectIsQuranReaderFloatingBannerVisible);
  const isFloatingReaderBanner =
    context === FundraisingBannerContext.QuranReader && layout === FundraisingBannerLayout.Floating;

  const isVisible = (() => {
    if (context !== FundraisingBannerContext.QuranReader) return isHomepageVisible;
    return isFloatingReaderBanner ? isQuranReaderFloatingVisible : isQuranReaderVisible;
  })();

  if (isDismissible && !isVisible) {
    return null;
  }

  const resolvedAnalyticsSource =
    analyticsSource ??
    (context === FundraisingBannerContext.QuranReader
      ? 'quran_reader_floating_banner'
      : 'homepage_donation_section');

  const onDonateClicked = () => {
    const href = makeDonatePageUrl(false, true);
    logButtonClick(`${resolvedAnalyticsSource}_donate`, {
      layout,
      ...analyticsParams,
    });
    navigateToExternalUrl(href);
  };

  const onCloseClicked = () => {
    logButtonClick(`${resolvedAnalyticsSource}_dismissed`, {
      layout,
      ...analyticsParams,
    });
    if (isFloatingReaderBanner) {
      dispatch(setIsQuranReaderFloatingBannerVisible(false));
    } else if (context === FundraisingBannerContext.QuranReader) {
      dispatch(setIsQuranReaderBannerVisible(false));
    } else {
      dispatch(setIsHomepageBannerVisible(false));
    }
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
        <p className={styles.description}>{t('fundraising-card-v2.description')}</p>
        <div className={styles.actions}>
          <Button
            onClick={onDonateClicked}
            type={ButtonType.Primary}
            size={ButtonSize.Small}
            variant={ButtonVariant.Simplified}
            className={styles.donateButton}
          >
            <DiamondIcon />
            {t('fundraising-card-v2.cta')}
          </Button>
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
  );
};

export default HomepageFundraisingBanner;
