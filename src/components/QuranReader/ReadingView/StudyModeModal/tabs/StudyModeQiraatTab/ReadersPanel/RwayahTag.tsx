import React from 'react';

import classNames from 'classnames';

import styles from './RwayahTag.module.scss';

import { QiraatTransmitter } from '@/types/Qiraat';

interface RwayahTagProps {
  transmitter: QiraatTransmitter;
  color: string;
  onClick?: () => void;
  isClickable?: boolean;
}

/**
 * Color-coded pill tag for a transmitter (Rwayah) name.
 * Background color matches the parent reading's card color.
 * @returns {JSX.Element} Rendered RwayahTag component
 */
const RwayahTag: React.FC<RwayahTagProps> = ({
  transmitter,
  color,
  onClick,
  isClickable = false,
}) => {
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      className={classNames(styles.tag, { [styles.clickable]: isClickable })}
      style={{ '--tag-color': color } as React.CSSProperties} // eslint-disable-line @typescript-eslint/naming-convention
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <span className={styles.tagName}>{transmitter.name}</span>
    </button>
  );
};

export default RwayahTag;
