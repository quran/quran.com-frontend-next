/* eslint-disable react/button-has-type */
import { Content, Modal, Trigger, Action } from './Modal';

export default {
  title: 'dls/Modal',
};

export const ModalNormal = () => (
  <Modal>
    <Trigger>test</Trigger>
    <Content>
      <p>test</p>
      <button>aa</button>
      <Action onClick={() => console.log('clicked')}>Submit</Action>
    </Content>
  </Modal>
);
