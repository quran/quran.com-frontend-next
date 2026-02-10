import React from 'react';

import { Separator } from '@radix-ui/react-separator';

import styles from './WordMobileModal.module.scss';

import Modal from '@/components/dls/Modal/Modal';
import { BottomActionsExpandProvider } from '@/components/QuranReader/contexts/BottomActionsExpandContext';
import BottomActions from '@/components/QuranReader/TranslationView/BottomActions';
import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import Verse from 'types/Verse';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  verse?: Verse;
}

/**
 * Mobile modal bottom sheet for word/verse actions in reading view
 * Displays top actions and bottom actions
 * @returns {React.FC} React component for mobile word actions modal
 */
const WordMobileModal: React.FC<Props> = ({ isOpen, onClose, verse }) => {
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
            <TopActions verse={verse} isTranslationView={false} />
          </div>

          <Separator className={styles.separator} />

          <div className={styles.bottomActionsContainer}>
            <BottomActionsExpandProvider>
              <BottomActions
                verseKey={verse.verseKey}
                isTranslationView={false}
                hasRelatedVerses={verse.hasRelatedVerses}
              />
            </BottomActionsExpandProvider>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default WordMobileModal;
