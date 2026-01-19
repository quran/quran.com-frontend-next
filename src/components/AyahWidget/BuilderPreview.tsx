import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/styles/embed.module.scss';

type Props = {
  previewRef: React.RefObject<HTMLDivElement>;
  embedSnippet: string;
  isCopySuccess: boolean;
  onCopy: () => void;
  isPreviewLoading: boolean;
};

const BuilderPreview = ({
  previewRef,
  embedSnippet,
  isCopySuccess: copySuccess,
  onCopy,
  isPreviewLoading,
}: Props) => {
  const { t } = useTranslation('embed');
  return (
    <div className={styles.previewColumn}>
      <div className={styles.previewPanel}>
        <div className={styles.codeHeader}>
          <h2 className={styles.panelTitle}>{t('sections.preview')}</h2>
          <button className={styles.copyButton} type="button" onClick={onCopy}>
            {copySuccess ? t('actions.copied') : t('actions.copyEmbedSnippet')}
          </button>
        </div>
        <div className={styles.previewContainer}>
          {isPreviewLoading && (
            <div
              className={styles.previewLoading}
              role="status"
              aria-live="polite"
              aria-label={t('states.loadingPreview')}
            >
              <div className={styles.spinner} />
            </div>
          )}
          <div className={styles.previewFrame} ref={previewRef} />
        </div>
      </div>

      <div className={styles.codePanel}>
        <div className={styles.codeHeader}>
          <h2 className={styles.panelTitle}>{t('sections.snippet')}</h2>
          <button className={styles.copyButton} type="button" onClick={onCopy}>
            {copySuccess ? t('actions.copied') : t('actions.copyEmbedSnippet')}
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
