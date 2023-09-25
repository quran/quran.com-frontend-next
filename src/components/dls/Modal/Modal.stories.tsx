/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
/* eslint-disable no-alert */
import { useState } from 'react';

import { ModalSize } from './Content';
import Modal from './Modal';

import Button, { ButtonVariant, ButtonType } from '@/dls/Button/Button';

export default {
  title: 'dls/Modal',
  component: Modal,
  argTypes: {
    isInvertedOverlay: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    isBottomSheetOnMobile: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    size: {
      control: {
        type: 'select',
        options: [...Object.values(ModalSize)],
      },
      defaultValue: ModalSize.MEDIUM,
    },
    isPropagationStopped: {
      control: {
        type: 'boolean',
      },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
    },
    children: {
      table: {
        category: 'Required',
      },
    },
    trigger: {
      table: {
        category: 'Optional',
      },
    },
    contentClassName: {
      table: {
        category: 'Optional',
      },
    },
  },
};

const DefaultTemplate = (args) => (
  <Modal trigger={<Button>This is a regular button component</Button>} {...args}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
  </Modal>
);

export const Default = DefaultTemplate.bind({});

const WithoutBottomSheetOnMobileTemplate = (args) => (
  <Modal
    trigger={<Button>This is a regular button component</Button>}
    isBottomSheetOnMobile={false}
    {...args}
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

export const WithoutBottomSheetOnMobile = WithoutBottomSheetOnMobileTemplate.bind({});

const WithGhostButtonTriggerTemplate = (args) => (
  <Modal
    trigger={
      <Button variant={ButtonVariant.Ghost} type={ButtonType.Success}>
        I am a ghost button with type success
      </Button>
    }
    {...args}
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

export const WithGhostButtonTrigger = WithGhostButtonTriggerTemplate.bind({});

const WithActionTemplate = (args) => (
  <Modal trigger={<Button>With Action</Button>} {...args}>
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

export const WithAction = WithActionTemplate.bind({});

const WithActionCallbackTemplate = (args) => (
  <Modal trigger={<Button>With Action</Button>} {...args}>
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

export const WithActionCallback = WithActionCallbackTemplate.bind({});

const WithDisabledActionTemplate = (args) => (
  <Modal trigger={<Button>With Action</Button>} {...args}>
    <Modal.Body>
      <Modal.Header>
        <Modal.Title>MODAL</Modal.Title>
        <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
      </Modal.Header>
      <p>Some content contained within this modal</p>
    </Modal.Body>
    <Modal.Footer>
      <Modal.CloseAction>Cancel</Modal.CloseAction>
      <Modal.Action isDisabled>Submit</Modal.Action>
    </Modal.Footer>
  </Modal>
);

export const WithDisabledAction = WithDisabledActionTemplate.bind({});

const WithControlledComponentTemplate = (args) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>a trigger button</Button>
      <Modal isOpen={open} onClickOutside={() => setOpen(false)} {...args}>
        <Modal.Body>
          <Modal.Header>
            <Modal.Title>MODAL</Modal.Title>
            <Modal.Subtitle>THIS IS A MODAL</Modal.Subtitle>
          </Modal.Header>
          <p>Some content contained within this modal</p>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Action onClick={() => setOpen(false)}>Cancel</Modal.Action>
          <Modal.Action isDisabled>Submit</Modal.Action>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export const WithControlledComponent = WithControlledComponentTemplate.bind({});
