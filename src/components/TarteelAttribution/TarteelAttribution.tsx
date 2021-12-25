import useTranslation from 'next-translate/useTranslation';

import TarteelLogo from '../../../public/icons/tarteel-logo.svg';
import TarteelText from '../../../public/icons/tarteel-text.svg';

import styles from './TarteelAttribution.module.scss';

const TarteelAttribution = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <span className={styles.poweredBy}>{t('voice.voice-search-powered-by')}</span>
      <TarteelLogo />
      <span className={styles.tarteelTextWrapper}>
        <TarteelText />
      </span>
    </div>
  );
};

export default TarteelAttribution;
