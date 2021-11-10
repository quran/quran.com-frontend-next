/* eslint-disable react/no-multi-comp */
import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import CommandBarBase from './CommandBarBase/CommandBarBase';

import Spinner from 'src/components/dls/Spinner/Spinner';
import { selectCommandBarIsOpen, setIsOpen, toggleIsOpen } from 'src/redux/slices/CommandBar/state';
import { stopCommandBarVoiceFlow } from 'src/redux/slices/voiceSearch';

const CommandBarBody = dynamic(() => import('./CommandBarBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

const CommandBar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCommandBarIsOpen, shallowEqual);
  const toggleShowCommandBar = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      dispatch({ type: toggleIsOpen.type });
    },
    [dispatch],
  );
  const closeCommandBar = useCallback(() => {
    dispatch({ type: setIsOpen.type, payload: false });
    dispatch({ type: stopCommandBarVoiceFlow.type });
  }, [dispatch]);
  useHotkeys('cmd+k, ctrl+k, cmd+p, ctrl+p', toggleShowCommandBar, { enableOnTags: ['INPUT'] }, [
    dispatch,
  ]);
  useHotkeys('Escape', closeCommandBar, { enabled: isOpen, enableOnTags: ['INPUT'] }, [dispatch]);

  return (
    <CommandBarBase isOpen={isOpen} onClickOutside={closeCommandBar}>
      <CommandBarBody />
    </CommandBarBase>
  );
};

export default CommandBar;
