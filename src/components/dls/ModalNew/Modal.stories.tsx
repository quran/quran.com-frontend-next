/* eslint-disable react/button-has-type */
import { Content, Modal, Trigger, Action, Actions } from './Modal';

export default {
  title: 'dls/Modal',
};

export const Default = () => (
  <Modal>
    <Trigger>test</Trigger>
    <Content>
      <p>test</p>
      <button>aa</button>
    </Content>
  </Modal>
);

export const WithAction = () => (
  <Modal>
    <Trigger>test</Trigger>
    <Content>
      <Actions>
        <Action>Cancel</Action>
        <Action>Submit</Action>
      </Actions>
    </Content>
  </Modal>
);
