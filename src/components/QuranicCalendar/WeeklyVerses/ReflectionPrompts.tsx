import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './WeeklyVerses.module.scss';

const ReflectionPrompts: React.FC = () => {
  const { t } = useTranslation('quranic-calendar');

  return (
    <>
      <h3 className={styles.promptsTitle}>
        <Trans
          i18nKey="quranic-calendar:reflection-prompts"
          components={{
            span: <span className={styles.promptsTitleSpan} />,
          }}
        />
      </h3>
      <ul className={styles.promptsList}>
        <li>{t('reflection-prompt-1')}</li>
        <li>{t('reflection-prompt-2')}</li>
        <li>{t('reflection-prompt-3')}</li>
      </ul>
    </>
  );
};

export default ReflectionPrompts;
