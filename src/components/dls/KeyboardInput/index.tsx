/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';

import styles from './KeyboardInput.module.scss';

// Returns ctrl or ⌘ based on the OS. This component is loaded on the client only to prevent hydration errors
const MetaShortcut = dynamic(() => import('./MetaShortcut'), {
  ssr: false,
});

interface Props {
  keyboardKey?: string;
  invertColors?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  ctrl?: boolean;
}

const KeyboardInput: React.FC<Props> = ({
  keyboardKey,
  meta,
  shift,
  alt,
  ctrl,
  invertColors = false,
}) => {
  return (
    <kbd className={classNames(styles.container, { [styles.invertedColors]: invertColors })}>
      {meta && <MetaShortcut />}
      {shift && <span>⇧</span>}
      {alt && <span>⌥</span>}
      {ctrl && <span>⌃</span>}
      {keyboardKey && <span>{keyboardKey}</span>}
    </kbd>
  );
};

export default KeyboardInput;
