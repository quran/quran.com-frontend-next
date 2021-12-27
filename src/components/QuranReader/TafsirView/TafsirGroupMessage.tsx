import useTranslation from 'next-translate/useTranslation';

import styles from './TafsirView.module.scss';

type TafsirGroupMessageProps = {
  from: string;
  to: string;
};

const TafsirGroupMessage = ({ from, to }: TafsirGroupMessageProps) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.tafsirGroupMessage}>
      {t('tafsir.group-message', {
        from,
        to,
      })}
    </div>
  );
};

export default TafsirGroupMessage;
