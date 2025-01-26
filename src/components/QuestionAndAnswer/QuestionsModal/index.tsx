import { useRef } from 'react';

import QuestionsModalHeader from './Header';
import ModalContent from './ModalContent';
import styles from './QuestionsModal.module.scss';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  onModalClick?: (e: React.MouseEvent) => void;
}

const QuestionsModal: React.FC<QuestionModalProps> = ({
  onClose,
  isOpen,
  verseKey,
  onModalClick,
}) => {
  const contentModalRef = useRef<ContentModalHandles>();

  return (
    <ContentModal
      innerRef={contentModalRef}
      onClick={onModalClick}
      isOpen={isOpen}
      header={<QuestionsModalHeader verseKey={verseKey} />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
      contentClassName={styles.contentModal}
      closeIconClassName={styles.closeIcon}
      headerClassName={styles.header}
      shouldBeFullScreen
    >
      {isOpen && <ModalContent verseKey={verseKey} />}
    </ContentModal>
  );
};

export default QuestionsModal;
