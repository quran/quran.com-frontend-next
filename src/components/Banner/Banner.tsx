import { useCallback } from 'react';

import classNames from 'classnames';

import styles from './Banner.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import DiamondIcon from '@/icons/diamond.svg';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

export enum BannerVariant {
  Standalone = 'standalone',
  InlineChip = 'inlineChip',
}

interface BannerCopy {
  desktop: string;
  mobileLineOne?: string;
  mobileLineTwo?: string;
}

interface BannerProps {
  text?: string;
  ctaButtonText?: string;
  variant?: BannerVariant;
  copy?: BannerCopy;
}

const Banner = ({ text, ctaButtonText, variant = BannerVariant.InlineChip, copy }: BannerProps) => {
  const desktopText = copy?.desktop || text || copy?.mobileLineOne || '';
  const shouldRenderTwoLineMobileCopy =
    variant === BannerVariant.Standalone && Boolean(copy?.mobileLineOne && copy?.mobileLineTwo);

  const handleButtonClick = useCallback(() => {
    logButtonClick('donate_button_banner');
  }, []);

  return (
    <div className={classNames(styles.container, styles[variant])} data-testid="banner">
      <div className={styles.text}>
        {shouldRenderTwoLineMobileCopy ? (
          <>
            <span className={styles.mobileLine}>{copy.mobileLineOne}</span>
            <span className={classNames(styles.mobileLine, styles.mobileLineUnderlined)}>
              {copy.mobileLineTwo}
            </span>
            <span className={styles.desktopLine}>{desktopText}</span>
          </>
        ) : (
          <span>{desktopText}</span>
        )}
      </div>
      {ctaButtonText && (
        <Link
          href={makeDonatePageUrl(false, true)}
          variant={LinkVariant.Blend}
          className={classNames(styles.cta, styles[`${variant}Cta`])}
          ariaLabel={ctaButtonText}
          onClick={handleButtonClick}
          isNewTab
        >
          <IconContainer
            icon={<DiamondIcon aria-hidden="true" />}
            size={IconSize.Xsmall}
            className={styles.icon}
            shouldForceSetColors={false}
          />
          {ctaButtonText}
        </Link>
      )}
    </div>
  );
};

export default Banner;
