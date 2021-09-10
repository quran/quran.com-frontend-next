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
    </Modal.Body>
    <Modal.Footer>
      <Modal.Action>Play {nextChapterName}</Modal.Action>
      <Modal.Action>Continue {currentChapterName}</Modal.Action>
    </Modal.Footer>
  </Modal>
);

export default AlertModal;
