import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionDisclaimerMessage.module.scss';

import ContentType from 'types/QuranReflect/ContentType';

interface Props {
  contentType?: ContentType;
}

const ReflectionDisclaimerMessage = ({ contentType }: Props) => {
  const { t } = useTranslation();
  return (
    <div className={styles.reflectionDisclaimerMessage}>
      {contentType === ContentType.REFLECTIONS
        ? t('quran-reader:reflection-disclaimer')
        : t('quran-reader:lessons-disclaimer')}
    </div>
  );
};

export default ReflectionDisclaimerMessage;
