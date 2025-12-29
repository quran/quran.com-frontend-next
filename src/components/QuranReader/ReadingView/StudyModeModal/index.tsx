import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './StudyModeModal.module.scss';

import ContentModal from '@/dls/ContentModal/ContentModal';
import Word from 'types/Word';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
}

/**
 * Study Mode modal for verse study and analysis
 * Displays study tools and resources for the selected verse
 * @param {Props} props - Component props
 * @returns React component for study mode modal
 */
const StudyModeModal: React.FC<Props> = ({ isOpen, onClose, word }) => {
  const { t } = useTranslation('common');
  const { verse } = word;

  if (!verse) return null;

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      header={t('study-mode')}
      hasCloseButton
      contentClassName={styles.contentModal}
      innerContentClassName={styles.innerContent}
    >
      <div className={styles.container}>{/* Content will be built in future PR */}</div>
    </ContentModal>
  );
};

export default StudyModeModal;
