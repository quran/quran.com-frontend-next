import React, { useState } from 'react';

import Modal, { ModalSize } from './Modal';

export default {
  title: 'dls/Modals',
  component: Modal,
  argTypes: {
    visible: {
      defaultValue: false,
      description: `Whether the modal dialog is visible or not`,
      table: {
        category: 'Required',
      },
    },
    centered: {
      defaultValue: false,
      description: `Whether the modal should be centered or not.`,
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'select' },
    },
    showCloseIcon: {
      defaultValue: true,
      description: `Whether a close (x) button is visible on the top right of the modal or not.`,
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'select' },
    },
    canCloseByKeyboard: {
      defaultValue: true,
      description: `Whether to support pressing esc to close the modal or not.`,
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'select' },
    },
    closeWhenClickingOutside: {
      defaultValue: true,
      description: `Whether to close the modal dialog when the mask (area outside the modal) is clicked.`,
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'select' },
    },
    children: {
      description: 'The modal body',
      table: {
        category: 'Optional',
      },
    },
    title: {
      description: 'The title of the modal.',
      table: {
        category: 'Optional',
      },
    },
    size: {
      defaultValue: ModalSize.Medium,
      description: 'The size of the modal.',
      table: {
        category: 'Optional',
      },
      options: [ModalSize.Small, ModalSize.Medium, ModalSize.Large, ModalSize.XLarge],
      control: { type: 'select' },
    },
    customCloseIcon: {
      description: 'Custom close icon',
      table: {
        category: 'Optional',
      },
    },
    onClose: {
      table: {
        category: 'Required',
      },
      description:
        'A function that will be called when a user clicks on the mask, closes the button on the top right or presses the escape key.',
    },
  },
};

const Template = (args) => {
  const { visible } = args;
  const [isVisible, setIsVisible] = useState(visible);
  const onClose = () => {
    setIsVisible(false);
  };
  const toggleVisibility = () => setIsVisible((prevIsVisible) => !prevIsVisible);
  return (
    <div>
      <button type="button" onClick={toggleVisibility}>
        Click to open modal
      </button>
      <Modal {...args} visible={isVisible} onClose={onClose} />
    </div>
  );
};

const ModalBody = <div>Modal body</div>;
const VeryLongModelBody = <div style={{ height: 1000 }}>Modal body</div>;
const VeryWideModelBody = <div style={{ width: 2000 }}>Modal body</div>;
const VeryWideAndLongModelBody = <div style={{ width: 2000, height: 10000 }}>Modal body</div>;

export const DefaultModal = Template.bind({});
DefaultModal.args = {
  children: ModalBody,
  title: 'Default Modal',
};

export const VerticallyScrollableModal = Template.bind({});
VerticallyScrollableModal.args = {
  children: VeryLongModelBody,
  title: 'Vertically Scrollable Modal',
};

export const HorizontallyScrollableModal = Template.bind({});
HorizontallyScrollableModal.args = {
  children: VeryWideModelBody,
  title: 'Horizontally Scrollable Modal',
};

export const VerticallyAndHorizontallyScrollableModal = Template.bind({});
VerticallyAndHorizontallyScrollableModal.args = {
  children: VeryWideAndLongModelBody,
  title: 'Vertically And Horizontally Scrollable Modal',
};

export const ModalWithoutCloseIcon = Template.bind({});
ModalWithoutCloseIcon.args = {
  children: ModalBody,
  title: 'Modal Without Close Icon',
  showCloseIcon: false,
};

export const ModalUnClosableByKeyboard = Template.bind({});
ModalUnClosableByKeyboard.args = {
  children: (
    <div>
      <p>Try pressing ESC it will not close</p>
    </div>
  ),
  title: 'Modal UnClosable By Keyboard',
  canCloseByKeyboard: false,
};

export const ModalUnClosableWhenClickingOutside = Template.bind({});
ModalUnClosableWhenClickingOutside.args = {
  children: (
    <div>
      <p>Try clicking outside the modal, it will not close</p>
    </div>
  ),
  title: 'Modal UnClosable When Clicking Outside',
  closeWhenClickingOutside: false,
};
