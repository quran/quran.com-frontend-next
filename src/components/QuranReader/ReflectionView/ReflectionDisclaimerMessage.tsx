import styles from './ReflectionDisclaimerMessage.module.scss';

const ReflectionDisclaimerMessage = () => {
  return (
    // eslint-disable-next-line i18next/no-literal-string
    <div className={styles.reflectionDisclaimerMessage}>
      Reflections does not represent the opinion of Quran.com and should not be taken out of context
    </div>
  );
};

export default ReflectionDisclaimerMessage;
