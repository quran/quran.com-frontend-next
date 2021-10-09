import React, { useCallback } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import CommandBarBody from './CommandBarBody';

import Modal from 'src/components/dls/Modal/Modal';
import { selectCommandBarIsOpen, setIsOpen, toggleIsOpen } from 'src/redux/slices/commandBar';

const CommandBar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCommandBarIsOpen, shallowEqual);
  const toggleShowCommandBar = useCallback(() => {
    dispatch({ type: toggleIsOpen.type });
  }, [dispatch]);
  const closeCommandBar = useCallback(() => {
    dispatch({ type: setIsOpen.type, payload: false });
  }, [dispatch]);
  useHotkeys('cmd+k, ctrl+k', toggleShowCommandBar, [dispatch]);
  useHotkeys('Escape', closeCommandBar, { enabled: isOpen, enableOnTags: ['INPUT'] }, [dispatch]);

  return (
    <Modal isOpen={isOpen} onClickOutside={closeCommandBar} isNormalMobileLayout>
      <CommandBarBody />
    </Modal>
  );
};

export default CommandBar;
