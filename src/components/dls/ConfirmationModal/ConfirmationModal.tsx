import Modal from '../Modal/Modal';

import { useConfirmModal } from './hooks';

const ConfirmationModal = () => {
  const { onCancel, onConfirm, state } = useConfirmModal();

  const actions = [];
  if (state.confirmText && onConfirm) {
    actions.push({
      label: state.confirmText,
      onClick: onConfirm,
      isPrimary: true,
    });
  }

  if (state.cancelText && onCancel) {
    actions.push({
      label: state.cancelText,
      onClick: onCancel,
      isPrimary: false,
    });
  }

  return (
    <Modal isOpen={!!state.open}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>{state.title}</Modal.Title>
          <Modal.Subtitle>{state.subtitle}</Modal.Subtitle>
        </Modal.Header>
        <p>{state.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Action onClick={onConfirm}>{state.confirmText}</Modal.Action>
        <Modal.CloseAction onClick={onCancel}>{state.cancelText}</Modal.CloseAction>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
