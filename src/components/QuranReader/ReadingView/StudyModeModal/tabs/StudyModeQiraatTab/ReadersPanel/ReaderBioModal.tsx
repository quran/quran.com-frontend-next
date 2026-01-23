import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReaderBioModal.module.scss';

import { QiraatReader } from '@/types/Qiraat';
import Modal from '@/dls/Modal/Modal';

interface ReaderBioModalProps {
  reader: QiraatReader | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal popup showing reader biography.
 */
const ReaderBioModal: React.FC<ReaderBioModalProps> = ({ reader, isOpen, onClose }) => {
  const { t } = useTranslation('common');

  if (!reader) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose}>
      <Modal.Body>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.name}>{reader.translatedName || reader.name}</h2>
            {reader.city && <span className={styles.city}>{reader.city}</span>}
          </div>

          <div className={styles.content}>
            <h3 className={styles.bioTitle}>{t('qiraat.reader-bio')}</h3>
            {reader.bio ? (
              <p className={styles.bioText}>{reader.bio}</p>
            ) : (
              <p className={styles.noBio}>{t('unavailable')}</p>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ReaderBioModal;
