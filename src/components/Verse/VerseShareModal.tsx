import useTranslation from 'next-translate/useTranslation';

import GeneratedImage from '@/components/Verse/GeneratedImage';
import Modal from '@/dls/Modal/Modal';
import Verse from '@/types/Verse';

type VerseShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  verse: Verse;
};

const VerseShareModal = ({ isOpen, onClose, verse }: VerseShareModalProps) => {
  const { t } = useTranslation('common');

  return (
    <Modal isOpen={isOpen} onClickOutside={onClose} onEscapeKeyDown={onClose}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>{t('share-modal.title')}</Modal.Title>
          <Modal.Subtitle>{t('share-modal.subtitle')}</Modal.Subtitle>
        </Modal.Header>
      </Modal.Body>
      <Modal.Footer>
        <GeneratedImage verse={verse} />
      </Modal.Footer>
    </Modal>
  );
};
export default VerseShareModal;
