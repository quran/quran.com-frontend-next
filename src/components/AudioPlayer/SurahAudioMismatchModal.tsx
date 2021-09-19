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
}: Props) => (
  <Modal isOpen={isOpen}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>
          You are currently playing <br />
          {currentAudioChapter}
        </Modal.Title>
      </Modal.Header>
      <p className={styles.bodyText}>
        Click on &quot;Start Over&quot; if you&rsquo;d like to play {currentReadingChapter} instead
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.Action onClick={onStartOver}>Start Over</Modal.Action>
      <Modal.Action onClick={onContinue}>Continue </Modal.Action>
    </Modal.Footer>
  </Modal>
);

export default SurahAudioMismatchModal;
