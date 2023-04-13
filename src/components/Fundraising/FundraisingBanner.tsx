import useTranslation from 'next-translate/useTranslation';

import MoonIllustrationSVG from '../../../public/images/moon-illustration.svg';

import DonateButton from './DonateButton';
import LearnMoreButton from './DonateButton/LearnMoreButton';
import styles from './FundraisingBanner.module.scss';

import DonateButtonClickSource from '@/types/DonateButtonClickSource';
import DonateButtonType from '@/types/DonateButtonType';
import LearnMoreClickSource from '@/types/LearnMoreClickSource';

const FundraisingBanner = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{t('fundraising.title')}</h1>
      <p className={styles.paragraph}>{t('fundraising.description')}</p>
      <div className={styles.buttonsContainer}>
        <DonateButton
          type={DonateButtonType.MONTHLY}
          source={DonateButtonClickSource.SIDEBAR_BANNER}
        />
        <LearnMoreButton source={LearnMoreClickSource.SIDEBAR_BANNER} />
      </div>
      <div className={styles.backgroundImageContainer}>
        <MoonIllustrationSVG />
      </div>
    </div>
  );
};

export default FundraisingBanner;
