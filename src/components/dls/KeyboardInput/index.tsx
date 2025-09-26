/* eslint-disable i18next/no-literal-string */
import React from 'react';

import classNames from 'classnames';

import styles from './KeyboardInput.module.scss';

interface Props {
  keyboardKey?: string;
  shouldInvertColors?: boolean;
  hasMeta?: boolean;
  hasShift?: boolean;
  hasAlt?: boolean;
  hasCtrl?: boolean;
}

const KeyboardInput: React.FC<Props> = ({
  keyboardKey,
  hasMeta,
  hasShift,
  hasAlt,
  hasCtrl,
  shouldInvertColors: invertColors = false,
}) => {
  const isMacOs = typeof window !== 'undefined' && window.navigator.userAgent.search('Mac') !== -1;
  return (
    <kbd className={classNames(styles.container, { [styles.invertedColors]: invertColors })}>
      {hasMeta && <span>{isMacOs ? '⌘' : 'ctrl'}</span>}
      {hasShift && <span>⇧</span>}
      {hasAlt && <span>⌥</span>}
      {hasCtrl && <span>⌃</span>}
      {keyboardKey && <span>{keyboardKey}</span>}
    </kbd>
  );
};

export default KeyboardInput;
