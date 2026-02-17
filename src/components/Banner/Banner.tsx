import { useCallback } from 'react';

import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import DiamondIcon from '@/icons/diamond.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { EXTERNAL_ROUTES } from '@/utils/navigation';

interface BannerProps {
  text: string;
  ctaButtonText?: string;
}

const Banner = ({ text, ctaButtonText }: BannerProps) => {
  const handleButtonClick = useCallback(() => {
    logButtonClick('donate_button_banner_clicked');
  }, []);

  return (
    <div className={styles.container} data-testid="banner">
      <div className={styles.text}>{text}</div>
      {ctaButtonText && (
        <Link
          href={EXTERNAL_ROUTES.DONATE_PAGE_URL}
          variant={LinkVariant.Blend}
          className={styles.cta}
          ariaLabel={ctaButtonText}
          onClick={handleButtonClick}
          isNewTab
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
