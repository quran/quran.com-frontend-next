import useTranslation from 'next-translate/useTranslation';

import styles from './SurahAudioMismatchModal.module.scss';

import Modal from 'src/components/dls/Modal/Modal';

type Props = {
  isOpen: boolean;
  currentAudioChapter: string;
  onContinue: (e) => void;
  currentReadingChapter: string;
  onStartOver: (e) => void;
};

const SurahAudioMismatchModal = ({
  isOpen,
  currentAudioChapter,
  currentReadingChapter,
  onContinue,
  onStartOver,
}: Props) => {
  const { t } = useTranslation('common');
  return (
    <Modal isOpen={isOpen}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>
            {t('audio.player.currently-playing')} <br />
            {currentAudioChapter}
          </Modal.Title>
        </Modal.Header>
        <p className={styles.bodyText}>{t('audio.player.mismatch', { currentReadingChapter })}</p>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={onStartOver}>{t('audio.player.start-over')}</Modal.Action>
        <Modal.Action onClick={onContinue}>{t('continue')}</Modal.Action>
      </Modal.Footer>
    </Modal>
  );
};

export default SurahAudioMismatchModal;
