import Modal from '../dls/Modal/Modal';
import styles from './SurahAudioMismatchModal.module.scss';

type Props = {
  open: boolean;
  currentAudioChapter: string;
  onContinue: (e) => void;
  currentReadingChapter: string;
  onStartOver: (e) => void;
};

const SurahAudioMismatchModal = ({
  open,
  currentAudioChapter,
  currentReadingChapter,
  onContinue,
  onStartOver,
}: Props) => (
  <Modal open={open}>
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
