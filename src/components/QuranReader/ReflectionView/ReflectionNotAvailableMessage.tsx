import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionDisclaimerMessage.module.scss';

import ContentType from 'types/QuranReflect/ContentType';

interface Props {
  contentType?: ContentType;
}

const ReflectionNotAvailableMessage = ({ contentType = ContentType.REFLECTIONS }: Props) => {
  const { t } = useTranslation();

  const message =
    contentType === ContentType.REFLECTIONS
      ? t('quran-reader:reflection-not-available')
      : t('quran-reader:lessons-not-available');

  return <div className={styles.reflectionDisclaimerMessage}>{message}</div>;
};

export default ReflectionNotAvailableMessage;
