import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationFeedbackDisclaimer.module.scss';

const TranslationFeedbackDisclaimer: React.FC = () => {
  const { t } = useTranslation('quran-reader');
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.container} data-testid="translation-feedback-disclaimer">
      <div className={styles.titleContainer}>
        {t('translation-feedback.disclaimer.title')}
        <button
          type="button"
          onClick={toggleOpen}
          className={styles.learnMoreButton}
          aria-expanded={isOpen}
          aria-controls="translation-feedback-disclaimer-content"
          data-testid="tfd-toggle"
        >
          {isOpen
            ? t('translation-feedback.disclaimer.see-less')
            : t('translation-feedback.disclaimer.learn-more')}
        </button>
      </div>
      {isOpen && (
        <div
          id="translation-feedback-disclaimer-content"
          className={styles.contentContainer}
          data-testid="tfd-content"
        >
          <div className={styles.sectionContainer}>
            <p className={styles.content}>{t('translation-feedback.disclaimer.content')}</p>
          </div>
          <button
            type="button"
            onClick={toggleOpen}
            className={classNames(styles.learnMoreButton, styles.seeLessButton)}
            aria-expanded={isOpen}
            aria-controls="translation-feedback-disclaimer-content"
          >
            {t('translation-feedback.disclaimer.see-less')}
          </button>
        </div>
      )}
    </div>
  );
};

export default TranslationFeedbackDisclaimer;
