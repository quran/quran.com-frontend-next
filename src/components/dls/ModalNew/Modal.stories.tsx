/* eslint-disable react/button-has-type */
import Modal from './Modal';

export default {
  title: 'dls/NewModal',
};

export const Default = () => (
  <Modal trigger={<Modal.Trigger>test</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Title>MODAL</Modal.Title>
      <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const WithAction = () => (
  <Modal trigger={<Modal.Trigger>test</Modal.Trigger>}>
    <Modal.Body>
      <Modal.Title>MODAL</Modal.Title>
      <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Actions>
      <Modal.Action>Cancel</Modal.Action>
      <Modal.Action>Submit</Modal.Action>
    </Modal.Actions>
  </Modal>
);
