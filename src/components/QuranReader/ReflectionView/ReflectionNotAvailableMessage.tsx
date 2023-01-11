import { useTranslation } from 'next-i18next';

import styles from './ReflectionDisclaimerMessage.module.scss';

const ReflectionNotAvailableMessage = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.reflectionDisclaimerMessage}>
      {t('quran-reader:reflection-not-available')}
    </div>
  );
};

export default ReflectionNotAvailableMessage;
