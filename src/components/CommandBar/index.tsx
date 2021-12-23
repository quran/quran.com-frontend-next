/* eslint-disable react/no-multi-comp */
import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './CommandBar.module.scss';
import CommandBarBase from './CommandBarBase/CommandBarBase';

import Spinner from 'src/components/dls/Spinner/Spinner';
import { selectCommandBarIsOpen, setIsOpen, toggleIsOpen } from 'src/redux/slices/CommandBar/state';
import { stopCommandBarVoiceFlow } from 'src/redux/slices/voiceSearch';
import { logEvent } from 'src/utils/eventLogger';

const CommandBarBody = dynamic(() => import('./CommandBarBody'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <Spinner />,
    </div>
  ),
});

const getPressedShortcut = (event: KeyboardEvent): string => {
  let shortcut = '';
  if (event.metaKey) {
    shortcut = 'cmd';
  } else if (event.ctrlKey) {
    shortcut = 'ctrl';
  }
  return `${shortcut}_${event.key}`;
};

const CommandBar: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCommandBarIsOpen, shallowEqual);
  const toggleShowCommandBar = useCallback(
    (event: KeyboardEvent) => {
      getPressedShortcut(event);
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`command_bar_${isOpen ? 'close' : 'open'}_${getPressedShortcut(event)}`);
      event.preventDefault();
      dispatch({ type: toggleIsOpen.type });
    },
    [dispatch, isOpen],
  );
  const closeCommandBar = useCallback(
    (isClickedOutside = false) => {
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`command_bar_close_${isClickedOutside ? 'outside_click' : 'esc_key'}`);
      dispatch({ type: setIsOpen.type, payload: false });
      dispatch({ type: stopCommandBarVoiceFlow.type });
    },
    [dispatch],
  );
  useHotkeys('cmd+k, ctrl+k, cmd+p, ctrl+p', toggleShowCommandBar, { enableOnTags: ['INPUT'] }, [
    dispatch,
  ]);
  useHotkeys('Escape', closeCommandBar, { enabled: isOpen, enableOnTags: ['INPUT'] }, [dispatch]);

  return (
    <CommandBarBase isOpen={isOpen} onClickOutside={() => closeCommandBar(true)}>
      <CommandBarBody />
    </CommandBarBase>
  );
};

export default CommandBar;
