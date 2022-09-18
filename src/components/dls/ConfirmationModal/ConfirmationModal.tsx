/* eslint-disable react/no-array-index-key */
import { useMemo } from 'react';

import { useConfirmModal } from './hooks';

import Modal from '@/dls/Modal/Modal';

const ConfirmationModal = () => {
  const { onCancel, onConfirm, state } = useConfirmModal();

  const actions = useMemo(() => {
    const returnedActions = [];
    if (state.confirmText && onConfirm) {
      returnedActions.push({
        label: state.confirmText,
        onClick: onConfirm,
      });
    }
    if (state.cancelText && onCancel) {
      returnedActions.push({
        label: state.cancelText,
        onClick: onCancel,
        isCloseAction: true,
      });
    }
    return returnedActions;
  }, [onCancel, onConfirm, state.cancelText, state.confirmText]);

  const onClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal isOpen={!!state.open} onClickOutside={onClose} onEscapeKeyDown={onClose}>
      <Modal.Body>
        <Modal.Header>
          <Modal.Title>{state.title}</Modal.Title>
          <Modal.Subtitle>{state.subtitle}</Modal.Subtitle>
        </Modal.Header>
        <p>{state.description}</p>
      </Modal.Body>
      <Modal.Footer>
        {actions.map((action, index) => {
          const { onClick, label } = action;
          if (action.isCloseAction) {
            return (
              <Modal.CloseAction key={index} onClick={onClick}>
                {label}
              </Modal.CloseAction>
            );
          }
          return (
            <Modal.Action key={index} onClick={onClick}>
              {label}
            </Modal.Action>
          );
        })}
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
