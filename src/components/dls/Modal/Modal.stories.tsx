/* eslint-disable no-alert */
import { useState } from 'react';
import Button, { ButtonVariant, ButtonType } from '../Button/Button';
import Modal from './Modal';

export default {
  title: 'dls/Modal',
};

export const Default = () => (
  <Modal trigger={<Button>This is a regular button component</Button>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const WithGhostButtonTrigger = () => (
  <Modal
    trigger={
      <Button variant={ButtonVariant.Ghost} type={ButtonType.Success}>
        I am a ghost button with type success
      </Button>
    }
  >
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const WithAction = () => (
  <Modal trigger={<Button>With Action</Button>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.CloseAction>Cancel</Modal.CloseAction>
      <Modal.Action>Submit</Modal.Action>
    </Modal.Footer>
  </Modal>
);

export const WithActionCallback = () => (
  <Modal trigger={<Button>With Action</Button>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>
        Click submit, you should see an alertaaa fafaskfas fkasf kasfaks faskf ajsl fakfaslkf
        aslfkas jjflafj alsf al l
      </p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.CloseAction>Cancel</Modal.CloseAction>
      <Modal.Action onClick={() => alert('Submit clicked')}>Submit</Modal.Action>
    </Modal.Footer>
  </Modal>
);

export const WithDisabledAction = () => (
  <Modal trigger={<Button>With Action</Button>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.CloseAction>Cancel</Modal.CloseAction>
      <Modal.Action disabled>Submit</Modal.Action>
    </Modal.Footer>
  </Modal>
);

export const WithControlledComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>a trigger button</Button>
      <Modal open={open} onClickOutside={() => setOpen(false)}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>MODAL</Modal.Title>
            <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
          </Modal.Header>
          <p>Some content contained within this modal</p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Action>Cancel</Modal.Action>
          <Modal.Action disabled>Submit</Modal.Action>
        </Modal.Footer>
      </Modal>
    </>
  );
};
