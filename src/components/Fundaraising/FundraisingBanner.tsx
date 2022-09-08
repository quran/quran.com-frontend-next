import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';

import styles from './FundraisingBanner.module.scss';

import Button, { ButtonType } from '@/dls/Button/Button';
import { makeDonateUrl } from '@/utils/apiPaths';
import { logEvent } from '@/utils/eventLogger';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  const onDonateClicked = () => {
    logEvent('donate_button_clicked', {
      source: 'sidebar_banner',
    });
  };
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <Button
        onClick={onDonateClicked}
        isNewTab
        href={makeDonateUrl(true)}
        type={ButtonType.Warning}
        className={styles.cta}
      >
        {t('donate')}
      </Button>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
