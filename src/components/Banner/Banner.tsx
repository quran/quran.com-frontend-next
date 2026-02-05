import { useCallback } from 'react';

import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import DiamondIcon from '@/icons/diamond.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { ROUTES } from '@/utils/navigation';

interface BannerProps {
  text: string;
  ctaButtonText?: string;
}

const Banner = ({ text, ctaButtonText }: BannerProps) => {
  const handleButtonClick = useCallback(() => {
    logButtonClick('ramadan_challenge_banner_cta');
  }, []);

  return (
    <div className={styles.container} data-testid="banner">
      <div className={styles.text}>{text}</div>
      {ctaButtonText && (
        <Link
          href={ROUTES.RAMADAN_CHALLENGE}
          variant={LinkVariant.Blend}
          className={styles.cta}
          ariaLabel={ctaButtonText}
          onClick={handleButtonClick}
        >
          <IconContainer
            icon={<DiamondIcon aria-hidden="true" />}
            size={IconSize.Xsmall}
            className={styles.icon}
            color={IconColor.tertiary}
          />
          {ctaButtonText}
        </Link>
      )}
    </div>
  );
};

export default Banner;
