import Modal from '../dls/Modal/Modal';
import styles from './SurahAudioMismatchModal.module.scss';

type Props = {
  open: boolean;
  currentAudioChapter: string;
  onContinue: () => void;
  currentReadingChapter: string;
  onStartOver: () => void;
};

const SurahAudioMismatchModal = ({ open, currentAudioChapter, currentReadingChapter }: Props) => (
  <Modal open={open}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>
          You are currently playing <br />
          {currentAudioChapter}
        </Modal.Title>
      </Modal.Header>
      <p className={styles.bodyText}>
        Click on Start Over if you&rsquo;d like to play {currentReadingChapter} instead
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.Action>Start Over</Modal.Action>
      <Modal.Action>Continue </Modal.Action>
    </Modal.Footer>
  </Modal>
);

export default SurahAudioMismatchModal;
