import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/styles/ayah-widget.module.scss';

type Props = {
  previewRef: React.RefObject<HTMLDivElement>;
  embedSnippet: string;
  isCopySuccess: boolean;
  onCopy: () => void;
};

const BuilderPreview = ({
  previewRef,
  embedSnippet,
  isCopySuccess: copySuccess,
  onCopy,
}: Props) => {
  const { t } = useTranslation('ayah-widget');
  return (
    <div className={styles.previewColumn}>
      <div className={styles.previewPanel}>
        <h2 className={styles.panelTitle}>{t('sections.preview')}</h2>
        <div className={styles.previewContainer} ref={previewRef} />
      </div>

      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <h2 className={styles.panelTitle}>{t('sections.snippet')}</h2>
          <button className={styles.copyButton} type="button" onClick={onCopy}>
            {copySuccess ? t('actions.copied') : t('actions.copy')}
          </button>
        </div>
        <pre className={styles.codeBlock}>
          <code>{embedSnippet}</code>
        </pre>
      </div>
    </div>
  );
};

export default BuilderPreview;
