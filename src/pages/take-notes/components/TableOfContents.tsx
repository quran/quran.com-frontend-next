import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/pages/contentPage.module.scss';

const TableOfContents: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <>
      <p className={styles.noMarginEnd}>
        <a href="#benefits">{t('table-of-contents.title')}</a>
      </p>
      <ol className={styles.decimalList}>
        {[
          { anchor: 'personal-reflection', text: t('table-of-contents.items.0') },
          { anchor: 'organize-preserve', text: t('table-of-contents.items.1') },
          { anchor: 'access-anywhere', text: t('table-of-contents.items.2') },
          { anchor: 'enhanced-memorization', text: t('table-of-contents.items.3') },
          { anchor: 'share-reflections', text: t('table-of-contents.items.4') },
        ].map(({ anchor, text }) => (
          <li key={`toc-${anchor}`}>
            <a href={`#${anchor}`}>{text}</a>
          </li>
        ))}
      </ol>
    </>
  );
};

export default TableOfContents;
