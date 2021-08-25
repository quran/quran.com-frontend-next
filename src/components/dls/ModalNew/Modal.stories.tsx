/* eslint-disable react/button-has-type */
import { Modal, Trigger, Action, Actions, Title, Body } from './Modal';

export default {
  title: 'dls/Modal',
};

export const Default = () => (
  <Modal trigger={<Trigger>test</Trigger>}>
    <Body>
      <p>test</p>
      <button>aa</button>
    </Body>
  </Modal>
);

export const WithAction = () => (
  <Modal trigger={<Trigger>test</Trigger>}>
    <Body>
      <Title>This is a title</Title>
    </Body>
    <Actions>
      <Action>Cancel</Action>
      <Action>Submit</Action>
    </Actions>
  </Modal>
);
