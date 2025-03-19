import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './WeeklyVerses.module.scss';

import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('quranic-calendar');
  const contentModalRef = useRef<ContentModalHandles>();

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
      contentClassName={styles.contentModal}
      closeIconClassName={styles.closeIcon}
      headerClassName={styles.header}
    >
      {isOpen && (
        <div className={styles.modalContent}>
          <p>{t('weekly-verses-help-description-1')}</p>
        </div>
      )}
    </ContentModal>
  );
};

export default HelpModal;
