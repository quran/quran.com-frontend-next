import useTranslation from 'next-translate/useTranslation';

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
