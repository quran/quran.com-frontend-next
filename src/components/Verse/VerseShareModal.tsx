import useTranslation from 'next-translate/useTranslation';

import GeneratedImage from '@/components/Verse/GeneratedImage';
import Modal from '@/dls/Modal/Modal';
import Verse from '@/types/Verse';
import styles from '@/redux/slices/QuranReader/styles';

type VerseShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse;
};

const VerseShareModal = ({ isOpen, onClose, verse }: VerseShareModalProps) => {
  const { t } = useTranslation('common');

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose} >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>{t('share-modal.title')}</Modal.Title>
          <Modal.Subtitle>{t('share-modal.subtitle')}</Modal.Subtitle>
        </Modal.Header>
      </Modal.Body>
      <Modal.Footer>
        <GeneratedImage verse={verse} />
      </Modal.Footer>
      </div>
    </Modal>
  );
};
export default VerseShareModal;
