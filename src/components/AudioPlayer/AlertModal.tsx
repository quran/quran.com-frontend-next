import Modal from '../dls/Modal/Modal';

type Props = {
  open: boolean;
  currentChapterName: string;
  onContinue: () => void;
  nextChapterName: string;
  onStartOver: () => void;
};

const AlertModal = ({ open, currentChapterName, nextChapterName }: Props) => (
  <Modal open={open}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>
          You are currently playing <br />
          {currentChapterName}
        </Modal.Title>
      </Modal.Header>
      <p>Click on Start Over if you&rsquo;d like to play {nextChapterName} instead</p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.Action>Start Over</Modal.Action>
      <Modal.Action>Continue </Modal.Action>
    </Modal.Footer>
  </Modal>
);

export default AlertModal;
