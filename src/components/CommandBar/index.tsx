/* eslint-disable react/no-multi-comp */
import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import styles from './CommandBar.module.scss';
import CommandBarBase from './CommandBarBase/CommandBarBase';

import Spinner from '@/dls/Spinner/Spinner';
import {
  selectCommandBarIsOpen,
  toggleIsOpenAction,
  setIsOpenAction,
} from '@/redux/slices/CommandBar/state';
import { stopCommandBarVoiceFlowAction } from '@/redux/slices/voiceSearch';
import { logEvent } from '@/utils/eventLogger';

const CommandBarBody = dynamic(() => import('./CommandBarBody'), {
  ssr: false,
  loading: () => (
    <div className={styles.loadingContainer}>
      <Spinner />
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
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`command_bar_${isOpen ? 'close' : 'open'}`, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        keyboard_shortcut: getPressedShortcut(event),
      });
      event.preventDefault();
      dispatch(toggleIsOpenAction());
    },
    [dispatch, isOpen],
  );
  const closeCommandBar = useCallback(
    (event?: KeyboardEvent) => {
      const isClickedOutside = !event;
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`command_bar_close_${isClickedOutside ? 'outside_click' : 'esc_key'}`);
      dispatch(setIsOpenAction(false));
      dispatch(stopCommandBarVoiceFlowAction());
    },
    [dispatch],
  );
  useHotkeys('cmd+k, ctrl+k, cmd+p, ctrl+p', toggleShowCommandBar, { enableOnTags: ['INPUT'] }, [
    dispatch,
  ]);
  useHotkeys('Escape', closeCommandBar, { enabled: isOpen, enableOnTags: ['INPUT'] }, [dispatch]);

  return (
    <CommandBarBase isOpen={isOpen} onClickOutside={() => closeCommandBar()}>
      <CommandBarBody />
    </CommandBarBase>
  );
};

export default CommandBar;
