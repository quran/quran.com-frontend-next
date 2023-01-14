/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';

import styles from './KeyboardInput.module.scss';

// this solves a hydration error because we detect the OS on the client side, so the text might be different on the server and the client
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
  const isMacOs = typeof window !== 'undefined' && window.navigator.userAgent.search('Mac') !== -1;

  return (
    <kbd className={classNames(styles.container, { [styles.invertedColors]: invertColors })}>
      {meta && (
        <span>
          <MetaShortcut isMacOs={isMacOs} />
        </span>
      )}
      {shift && <span>⇧</span>}
      {alt && <span>⌥</span>}
      {ctrl && <span>⌃</span>}
      {keyboardKey && <span>{keyboardKey}</span>}
    </kbd>
  );
};

export default KeyboardInput;
