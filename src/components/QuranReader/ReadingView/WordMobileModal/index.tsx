import React from 'react';

import { Separator } from '@radix-ui/react-separator';

import styles from './WordMobileModal.module.scss';

import Modal from '@/components/dls/Modal/Modal';
import BottomActions from '@/components/QuranReader/TranslationView/BottomActions';
import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import Word from 'types/Word';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
}

/**
 * Mobile modal bottom sheet for word actions in reading view
 * Displays top actions, and bottom actions
 * @returns {React.FC} React component for mobile word actions modal
 */
const WordMobileModal: React.FC<Props> = ({ isOpen, onClose, word }) => {
  const { verse } = word;
  if (!verse) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={onClose}
      onEscapeKeyDown={onClose}
      isBottomSheetOnMobile
      contentClassName={styles.contentClassName}
      overlayClassName={styles.overlayClassName}
    >
      <Modal.Body>
        <div className={styles.container}>
          <div className={styles.topActionsContainer}>
            <TopActions verse={verse} bookmarksRangeUrl="" isTranslationView={false} />
          </div>

          <Separator className={styles.separator} />

          <div className={styles.bottomActionsContainer}>
            <BottomActions verseKey={verse.verseKey} isTranslationView={false} />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default WordMobileModal;
