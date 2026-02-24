import { useCallback } from 'react';

import styles from './Banner.module.scss';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import Link, { LinkVariant } from '@/dls/Link/Link';
import DiamondIcon from '@/icons/diamond.svg';
import { UiSectionContentFormat } from '@/types/UiSection';
import { logButtonClick } from '@/utils/eventLogger';

interface BannerProps {
  text: string;
  textFormat?: UiSectionContentFormat;
  ctaButtonText?: string;
  ctaUrl?: string;
}

const Banner = ({ text, textFormat = 'plain_text', ctaButtonText, ctaUrl }: BannerProps) => {
  const handleButtonClick = useCallback(() => {
    logButtonClick('navbar_banner_cta');
  }, []);

  return (
    <div className={styles.container} data-testid="banner">
      {textFormat === 'html' ? (
        // eslint-disable-next-line react/no-danger
        <div className={styles.text} dangerouslySetInnerHTML={{ __html: text }} />
      ) : (
        <div className={styles.text}>{text}</div>
      )}
      {ctaButtonText && ctaUrl && (
        <Link
          href={ctaUrl}
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
