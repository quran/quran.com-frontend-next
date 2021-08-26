/* eslint-disable no-alert */
import { ButtonVariant, ButtonType } from '../Button/Button';
import Modal from './Modal';

export default {
  title: 'dls/NewModal',
};

export const Default = () => (
  <Modal trigger={<Modal.Trigger>This is a regular button component</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Title>MODAL</Modal.Title>
      <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const WithGhostButtonTrigger = () => (
  <Modal
    trigger={
      <Modal.Trigger variant={ButtonVariant.Ghost} type={ButtonType.Success}>
        I am a ghost button with type success
      </Modal.Trigger>
    }
  >
    <Modal.Body>
      <Modal.Title>MODAL</Modal.Title>
      <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const WithAction = () => (
  <Modal trigger={<Modal.Trigger>With Action</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Actions>
      <Modal.Action>Cancel</Modal.Action>
      <Modal.Action>Submit</Modal.Action>
    </Modal.Actions>
  </Modal>
);

export const WithActionCallback = () => (
  <Modal trigger={<Modal.Trigger>With Action</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Actions>
      <Modal.Action onClick={() => alert('cancel clicked')}>Cancel</Modal.Action>
      <Modal.Action onClick={() => alert('Submit clicked')}>Submit</Modal.Action>
    </Modal.Actions>
  </Modal>
);

export const WithDisabledAction = () => (
  <Modal trigger={<Modal.Trigger>With Action</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Actions>
      <Modal.Action>Cancel</Modal.Action>
      <Modal.Action disabled>Submit</Modal.Action>
    </Modal.Actions>
  </Modal>
);
