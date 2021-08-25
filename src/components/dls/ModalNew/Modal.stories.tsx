/* eslint-disable react/button-has-type */
import Button from '../Button/Button';
import { Modal, Trigger, Action, Actions, Title, Body, Subtitle } from './Modal';

export default {
  title: 'dls/Modal',
};

export const Default = () => (
  <Modal trigger={<Trigger as={Button}>test</Trigger>}>
    <Body>
      <p>test</p>
      <button>aa</button>
    </Body>
  </Modal>
);

export const WithAction = () => (
  <Modal trigger={<Trigger>test</Trigger>}>
    <Body>
      <Title>MODAL</Title>
      <Subtitle>THIS IS A MODAL</Subtitle>
      <p>Some content contained within this modal</p>
    </Body>
    <Actions>
      <Action>Cancel</Action>
      <Action>Submit</Action>
    </Actions>
  </Modal>
);
