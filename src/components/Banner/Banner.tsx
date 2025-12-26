import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './Banner.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import Link from '@/dls/Link/Link';
import MoonIllustrationSVG from '@/public/images/moon-illustration.svg';
import { makeDonatePageUrl } from '@/utils/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

type BannerProps = {
  text: string;
  shouldShowPrefixIcon?: boolean;
};

const Banner = ({ text, shouldShowPrefixIcon = true }: BannerProps) => {
  const { t } = useTranslation('common');

  const handleDonationClick = () => {
    logButtonClick('banner_cta', {
      isDonationCampaign: true,
    });
  };

  return (
    <div className={classNames(styles.container, styles.isVisible)}>
      <div className={styles.description}>
        {shouldShowPrefixIcon && (
          <div className={styles.illustrationContainer}>
            <MoonIllustrationSVG />
          </div>
        )}
        <div className={styles.text}>{text}</div>
      </div>
      <div className={styles.ctaContainer}>
        <Link href={makeDonatePageUrl(false, true)} isNewTab>
          <Button
            size={ButtonSize.Small}
            variant={ButtonVariant.Outlined}
            onClick={handleDonationClick}
          >
            {t('fundraising.donation-campaign.cta')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Banner;
