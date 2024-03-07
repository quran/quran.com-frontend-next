import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionsTabIntroduction.module.scss';

import Link, { LinkVariant } from '@/dls/Link/Link';

const ReflectionsTabIntroduction = () => {
  const { t } = useTranslation('notes');

  return (
    <div className={styles.container}>
      <div className={styles.title}>{t('reflections-intro.title')}</div>
      <ul>
        <li>
          <Trans
            components={{
              li: <li key={0} />,
              link: (
                <Link
                  key={0}
                  href="https://quranreflect.com"
                  variant={LinkVariant.Blend}
                  isNewTab
                />
              ),
            }}
            i18nKey="notes:reflections-intro.line-1"
          />
        </li>
        <li>{t('reflections-intro.line-2')}</li>
        <li>{t('reflections-intro.line-3')}</li>
      </ul>
    </div>
  );
};

export default ReflectionsTabIntroduction;
