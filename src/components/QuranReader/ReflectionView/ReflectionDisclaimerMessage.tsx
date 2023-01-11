import { useTranslation } from 'next-i18next';

import styles from './ReflectionDisclaimerMessage.module.scss';

const ReflectionDisclaimerMessage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.reflectionDisclaimerMessage}>
      {t('quran-reader:reflection-disclaimer')}
    </div>
  );
};

export default ReflectionDisclaimerMessage;
