import useTranslation from 'next-translate/useTranslation';

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
