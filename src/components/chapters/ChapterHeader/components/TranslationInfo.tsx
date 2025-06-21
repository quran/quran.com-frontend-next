import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

interface TranslationInfoProps {
  translationName: string;
  isTranslationSelected?: boolean;
  onChangeTranslationClicked: () => void;
}

/**
 * TranslationInfo component displays translation information with a change option
 * @param {TranslationInfoProps} props - Component props
 * @returns {JSX.Element} The TranslationInfo component
 */
const TranslationInfo: React.FC<TranslationInfoProps> = ({
  translationName,
  isTranslationSelected,
  onChangeTranslationClicked,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.translation}>
      {isTranslationSelected && (
        <div className={styles.translationBy}>{t('quran-reader:translation-by')}</div>
      )}
      <span>{translationName}</span>{' '}
      <span
        onKeyPress={onChangeTranslationClicked}
        tabIndex={0}
        role="button"
        onClick={onChangeTranslationClicked}
        className={styles.changeTranslation}
        aria-label={t('quran-reader:trans-change')}
      >
        ({t('quran-reader:trans-change')})
      </span>
    </div>
  );
};

export default TranslationInfo;
