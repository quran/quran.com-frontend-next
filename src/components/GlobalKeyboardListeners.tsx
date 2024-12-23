import React, { useCallback } from 'react';

import { useHotkeys } from 'react-hotkeys-hook';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

import { selectIsSearchDrawerOpen, toggleSearchDrawerIsOpen } from '@/redux/slices/navbar';
import { logEvent } from '@/utils/eventLogger';

const getPressedShortcut = (event: KeyboardEvent): string => {
  let shortcut = '';
  if (event.metaKey) {
    shortcut = 'cmd';
  } else if (event.ctrlKey) {
    shortcut = 'ctrl';
  }
  return `${shortcut}_${event.key}`;
};

const GlobalKeyboardListeners: React.FC = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsSearchDrawerOpen, shallowEqual);
  const toggleShowCommandBar = useCallback(
    (event: KeyboardEvent) => {
      // eslint-disable-next-line i18next/no-literal-string
      logEvent(`search_drawer_${isOpen ? 'close' : 'open'}`, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        keyboard_shortcut: getPressedShortcut(event),
      });
      event.preventDefault();
      dispatch({ type: toggleSearchDrawerIsOpen.type });
    },
    [dispatch, isOpen],
  );
  useHotkeys(
    'meta+k, ctrl+k, meta+p, ctrl+p',
    toggleShowCommandBar,
    { enableOnFormTags: ['INPUT'] },
    [dispatch],
  );
  return <></>;
};

export default GlobalKeyboardListeners;
